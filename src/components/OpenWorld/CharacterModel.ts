import * as THREE from 'three';
import { CustomSkin } from '../../types/game';

export class AnimeCharacter {
  public group: THREE.Group;
  public skin: CustomSkin;

  // Body parts for animation
  private head: THREE.Group;
  private torso: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private katana: THREE.Group;
  private scarfSegments: THREE.Mesh[] = [];
  private auraLight: THREE.PointLight;

  // Animation variables
  private walkTime: number = 0;
  private slashTime: number = 0;
  private isSlashing: boolean = false;
  private dodgeTime: number = 0;

  constructor(skin: CustomSkin, isPedestal: boolean = false) {
    this.skin = skin;
    this.group = new THREE.Group();

    const primaryColor = new THREE.Color(skin.primaryColor);
    const secondaryColor = new THREE.Color(skin.secondaryColor);
    const darkArmor = new THREE.Color('#0F172A');
    const metalGrey = new THREE.Color('#334155');

    // Materials
    const armorMat = new THREE.MeshStandardMaterial({
      color: darkArmor,
      roughness: 0.35,
      metalness: 0.85,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.9,
    });

    const bladeMat = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      emissive: primaryColor,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.95,
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: metalGrey,
      roughness: 0.5,
      metalness: 0.6,
    });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.55, 0.7, 0.35);
    this.torso = new THREE.Mesh(torsoGeo, armorMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Chest core / reactor
    const coreGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16);
    coreGeo.rotateX(Math.PI / 2);
    const core = new THREE.Mesh(coreGeo, accentMat);
    core.position.set(0, 0.08, 0.18);
    this.torso.add(core);

    // 2. Head & Visor
    this.head = new THREE.Group();
    this.head.position.set(0, 0.52, 0);

    const headGeo = new THREE.BoxGeometry(0.38, 0.42, 0.38);
    const headMesh = new THREE.Mesh(headGeo, armorMat);
    this.head.add(headMesh);

    // Glowing Cyber Visor
    const visorGeo = new THREE.BoxGeometry(0.34, 0.12, 0.15);
    const visor = new THREE.Mesh(visorGeo, accentMat);
    visor.position.set(0, 0.02, 0.18);
    this.head.add(visor);

    // Horns / Crest (special for Oni or Gold skins)
    if (skin.id === 'crimson_oni') {
      const hornGeo = new THREE.ConeGeometry(0.06, 0.32, 8);
      const leftHorn = new THREE.Mesh(hornGeo, accentMat);
      leftHorn.position.set(-0.16, 0.28, 0.05);
      leftHorn.rotation.z = -0.35;
      leftHorn.rotation.x = -0.2;
      const rightHorn = new THREE.Mesh(hornGeo, accentMat);
      rightHorn.position.set(0.16, 0.28, 0.05);
      rightHorn.rotation.z = 0.35;
      rightHorn.rotation.x = -0.2;
      this.head.add(leftHorn);
      this.head.add(rightHorn);
    } else if (skin.id === 'amaterasu_gold') {
      const haloGeo = new THREE.TorusGeometry(0.32, 0.03, 8, 24);
      const halo = new THREE.Mesh(haloGeo, accentMat);
      halo.position.set(0, 0.08, -0.15);
      this.head.add(halo);
    }

    this.torso.add(this.head);

    // 3. Cyber Scarf / Cape (4 flowing segments)
    const scarfGeo = new THREE.BoxGeometry(0.25, 0.18, 0.04);
    for (let i = 0; i < 4; i++) {
      const seg = new THREE.Mesh(scarfGeo, accentMat);
      seg.position.set(0, 0.25 - i * 0.16, -0.22 - i * 0.08);
      seg.rotation.x = -0.35;
      this.torso.add(seg);
      this.scarfSegments.push(seg);
    }

    // 4. Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.38, 0.25, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.2), jointMat);
    leftArmMesh.position.y = -0.25;
    this.leftArm.add(leftArmMesh);
    this.torso.add(this.leftArm);

    // 5. Right Arm (Sword Hand)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.38, 0.25, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.2), jointMat);
    rightArmMesh.position.y = -0.25;
    this.rightArm.add(rightArmMesh);

    // 6. Katana / Energy Blade
    this.katana = new THREE.Group();
    this.katana.position.set(0, -0.55, 0.2);

    // Hilt
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), jointMat);
    hilt.position.y = -0.1;
    this.katana.add(hilt);

    // Tsuba (guard)
    const tsuba = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.14), accentMat);
    this.katana.add(tsuba);

    // Energy Blade
    const bladeGeo = new THREE.BoxGeometry(0.06, 1.1, 0.02);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.58;
    this.katana.add(blade);

    // Tip angle
    this.katana.rotation.x = Math.PI / 4;
    this.rightArm.add(this.katana);
    this.torso.add(this.rightArm);

    // 7. Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.16, 0.95, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.24), armorMat);
    leftLegMesh.position.y = -0.45;
    this.leftLeg.add(leftLegMesh);
    this.group.add(this.leftLeg);

    // 8. Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.16, 0.95, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.24), armorMat);
    rightLegMesh.position.y = -0.45;
    this.rightLeg.add(rightLegMesh);
    this.group.add(this.rightLeg);

    // 9. Aura Point Light
    this.auraLight = new THREE.PointLight(primaryColor, 1.5, 3.5);
    this.auraLight.position.set(0, 1.5, 0);
    this.group.add(this.auraLight);

    if (isPedestal) {
      // Pedestal pose: dignified stance with blade planted or raised
      this.rightArm.rotation.x = -0.4;
      this.katana.rotation.x = -0.2;
      this.katana.rotation.z = -0.3;
    }
  }

  public triggerSlash() {
    this.isSlashing = true;
    this.slashTime = 0;
  }

  public update(delta: number, isMoving: boolean, isDodging: boolean) {
    // 1. Scarf fluttering
    this.scarfSegments.forEach((seg, idx) => {
      seg.rotation.x = -0.35 + Math.sin(this.walkTime * 8 + idx * 0.8) * 0.12;
      seg.rotation.y = Math.cos(this.walkTime * 6 + idx * 0.5) * 0.15;
    });

    // 2. Dodge animation
    if (isDodging) {
      this.dodgeTime += delta * 6;
      this.group.scale.set(1.15, 0.85, 1.35); // compression / motion stretch
      this.torso.rotation.x = 0.5;
      this.auraLight.intensity = 3.5;
    } else {
      this.group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0, 0.15);
      this.auraLight.intensity = 1.5;
    }

    // 3. Slash attack animation
    if (this.isSlashing) {
      this.slashTime += delta * 7;
      const progress = Math.min(1, this.slashTime);
      this.rightArm.rotation.x = -Math.PI / 2 + Math.sin(progress * Math.PI) * 1.8;
      this.rightArm.rotation.y = -0.6 + Math.sin(progress * Math.PI) * 1.2;

      if (progress >= 1) {
        this.isSlashing = false;
        this.slashTime = 0;
      }
    }

    // 4. Locomotion / Idle Animation
    if (isMoving) {
      this.walkTime += delta * 12;
      const swing = Math.sin(this.walkTime);

      this.leftLeg.rotation.x = swing * 0.65;
      this.rightLeg.rotation.x = -swing * 0.65;

      this.leftArm.rotation.x = -swing * 0.5;
      if (!this.isSlashing) {
        this.rightArm.rotation.x = swing * 0.4 - 0.2;
      }

      this.torso.position.y = 1.35 + Math.abs(Math.sin(this.walkTime * 2)) * 0.08;
    } else {
      // Idle breathing
      this.walkTime += delta * 2.5;
      const breathe = Math.sin(this.walkTime) * 0.03;

      this.torso.position.y = 1.35 + breathe;
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.1);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.1);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);

      if (!this.isSlashing && !isDodging) {
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -0.2, 0.1);
      }
    }
  }
}
