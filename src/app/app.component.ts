import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { OneSignalController } from '../OneSignalController';
import { UserService, User, UserParams, WasUp, WasAlert, WasPay, PromptUpdateService } from 'wickeyappstore';

// Phaser v3
// import * as Phaser from 'phaser';
// Phaser-ce
import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import { Game, AUTO, IGameConfig } from 'phaser-ce';
// import * as Phaser from 'phaser-ce/build/custom/phaser-split';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // (1) SET THESE VALUES FOR YOUR APP ****************************
  public title = 'Classic Game';
  public version = '0.0.1';
  public whats_new = 'New game';
  // (2) UPDATE the version to match in package.json ****************************
  //     UPDATE the version & whats_new in ngsw-config.json
  //
  //
  // (3) SET THESE VALUES FOR YOUR APP ****************************
  // IF YOU DO NOT HAVE PUSH NOTIFICATIONS just set ONESIGNAL_ENABLED = FALSE
  private ONESIGNAL_ENABLED = false;
  private oneSignalAppId = '';
  private oneSignalSafariWebId = '';
  private oneSignalConfig = { title: this.title, exampleNotificationMessage: 'New game levels are here, get em now!' };
  //


  // Variables //
  // push controller
  private oneSignalController = new OneSignalController;

  public levelPurchaseId = 10;  // This is from the developer.wickeyappstore.com panel after inapps are added.

  // GAME VARIABLES //
  public game: Game;
  public logo: any;
  public emitter: any;

  constructor(
    public userService: UserService,
    private promptUpdateService: PromptUpdateService,
    public dialog: MatDialog
  ) {
    // Pushes update on all login status changes (also pushes status on initial load)
    this.userService.loginChange.subscribe((_isLogged: boolean) => {
      console.log('USER LOADED:', this.userService.userObject.user_id);
      if (_isLogged) {
        console.warn('LOGGED IN');
        // load save data from server
        // this.getFromCloud();
      } else {
        console.warn('LOGGED OUT');
        // reset progress
      }
      // Wait to initialize game till user has been loaded
      this.initializePhaser();
      // This initiate the Push Service. Do on login status changes
      this.oneSignalController.loadPushSystem(this.userService, this.oneSignalAppId, this.oneSignalSafariWebId,
        this.oneSignalConfig, this.ONESIGNAL_ENABLED);
    });
  }

  ///////////////////////////////////
  // PHASER GAME CODE
  ///////////////////////////////////
  initializePhaser() {
    this.game = new Game(window.innerWidth, window.innerHeight, AUTO, 'phaser-example', {
      preload: this.preload,
      create: this.create,
      update: this.update
    });
  }
  preload() {
    this.game.load.image('sky', 'assets/space3.png');
    this.game.load.image('logo', 'assets/phaser2-logo.png');
    this.game.load.image('red', 'assets/red.png');
  }
  create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    const sky = this.game.add.image(this.game.world.centerX, this.game.world.centerY, 'sky');
    // anchor to center
    sky.anchor.setTo(0.5, 0.5);
    // set background to fill the screen
    sky.scale.set(window.innerWidth / sky.width, window.innerHeight / sky.height);

    // Add the logo
    this.logo = this.game.add.sprite(this.game.world.centerX - 100, this.game.world.centerY, 'logo');
    this.game.physics.enable(this.logo, Phaser.Physics.ARCADE);
    this.logo.anchor.setTo(0.5, 0.5);

    //  Create our tween. This will fade the sprite to alpha 1 over the duration of 2 seconds
    const tween = this.game.add.tween(this.logo).to({ x: this.game.world.centerX + 100 }, 2000, "Linear", true, 0, -1);

    //  And this tells it to yoyo, i.e. fade back to zero again before repeating.
    //  The 2000 tells it to wait for 1 seconds before starting the fade back.
    tween.yoyo(true, 2000);

    this.emitter = this.game.add.emitter(0, 0, 100);
    this.emitter.makeParticles('red');
    this.emitter.minParticleSpeed.setTo(-600, 60);
    this.emitter.maxParticleSpeed.setTo(600, 200);
    this.emitter.minParticleScale = 0.5;
    this.emitter.maxParticleScale = 1;
    //  This will emit a quantity of 5 particles every 50ms. Each particle will live for 2000ms.
    //  The -1 means "run forever"
    this.emitter.flow(2000, 1, 1, -1);
    this.game.physics.enable(this.emitter, Phaser.Physics.ARCADE);

  }
  update() {
    this.emitter.x = this.logo.x - 40;
    this.emitter.y = this.logo.y - this.logo.height * .5 + 20;
  }



  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // AIR HORN SAVE/GET
  // We are using 'horn_key' as our identifier. Any key is valid - if you set it, you can update it and read from it.
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // TODO: Use new CloudSync in WAS
  saveToCloud() {
    // this.userService.setStore({ 'horn_key': this.horn_presses });
  }
  getFromCloud() {
    const _mykey = 'horn_key';
    this.userService.getStore([_mykey]).subscribe((res) => {
      // console.log('WAS: getMetaData RETURN:', res);
      if (res[_mykey]) {
        // this.horn_presses = Number(res[_mykey]);
      }
    }, (error) => {
      // may want to deal with the error - or ignore and try it again
    });
  }
  deleteKeyStoreCloud(key: string) {
    const _mykeys = [key];
    this.userService.deleteStore(_mykeys).subscribe((res) => {
      // console.log('WAS: deleteStore RETURN:', res);
    }, (error) => {
      // may want to deal with the error - or ignore and try it again
      // this.dialog.open(WasAlert, {data: { title: 'Attention', body: error }});
    });
  }

}
