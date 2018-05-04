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
  public whats_new = 'Updated libraries & organized push notifications. Add configurations.';
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
  public text: any;
  private gameConfig: IGameConfig;
  public game1_highscore = 0;

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
      this.initGame1();
      // This initiate the Push Service. Do on login status changes
      this.oneSignalController.loadPushSystem(this.userService, this.oneSignalAppId, this.oneSignalSafariWebId,
        this.oneSignalConfig, this.ONESIGNAL_ENABLED);
    });
  }

  ///////////////////////////////////
  // GAME ONE
  ///////////////////////////////////
  initGame1() {
    this.game = new Game(window.innerWidth - 40, window.innerHeight - 90, AUTO, 'phaser-example', {
      preload: this.preload,
      create: this.create
    });
  }
  preload() {
    this.game.load.image('logo', 'assets/wwlogo.png');
  }
  create() {
    this.logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.logo.anchor.setTo(0.5, 0.5);
    const _xScale = (window.innerWidth - 20) / this.logo.width;
    this.logo.width *= _xScale;
    this.logo.height *= _xScale;
    this.text = this.game.add.text(250, 16, 'Work At Play', { fill: '#ffffff' });
    // this.text.x = this.logo.x - (this.text.width / 5);
    this.text.anchor.setTo(0.5, 0.5);
    this.text.y = this.logo.y + (this.logo.height / 2) + (this.text.height / 2);
  }
  ///////////////////////////////////
  // GAME ONE
  ///////////////////////////////////

  // Check if game available
  playGame(gameId: number) {
    console.log('playGame', gameId);
    if (gameId === 1) {
      console.log('allow game 1');
      // TODO: Maybe a fullscreen overlay
    } else {
      const _level2Inapp = this.userService.getInapp(this.levelPurchaseId);
      // check if locked
      if (_level2Inapp && _level2Inapp.isOwned === true) {
        console.log('allow game 2');
      } else {
        console.log('this game is locked');
        this.dialog.open(WasPay, { data: _level2Inapp }).afterClosed().subscribe(_isSuccess => {
          if (_isSuccess === true) {
            this.playGame(gameId);
          }
        });
      }
    }
  }

  //  Return the login message
  get displayMessage() {
    return this.userService.user.map((usr: User) => {
      let _displayMsg = '';
      if (usr.email) {
        _displayMsg = 'Welcome Back!';
      } else {
        _displayMsg = 'Sign in with the WickeyAppStore button';
      }
      return _displayMsg;
    });
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
