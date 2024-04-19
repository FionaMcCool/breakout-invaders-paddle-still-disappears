constructor();
          super({ key: "SpaceBreakout" });

          this.aliens;
          this.paddle;
          this.ball;
          this.lasers;
          this.alienVelocityX = 50; // Initial horizontal velocity for aliens
    

        preload();
          this.load.atlas("assets", "assets/breakoutsprites.png", "assets/breakout.json");
          // Load laser asset, assuming a laser image is available in the atlas
        

        create()
          // Enable world bounds, but disable the floor
          this.physics.world.setBoundsCollision(true, true, true, false);

          // Create the aliens (formerly bricks) in a 10x3 grid that moves
          this.aliens = this.physics.add.group({
            key: "assets",
            frame: ["yellow1", "white1", "red1"],
            frameQuantity: 10,
            gridAlign: { width: 6, height: 3, cellWidth: 150, cellHeight: 90, x: 112, y: 50 },
          });

          // Make the aliens move and bounce
          this.aliens.children.iterate((alien) => {
            alien.setVelocityX(50);
            alien.setCollideWorldBounds(true);
            alien.setBounce(1, 0); // Adjust as needed
          });

          // Create lasers group
          this.lasers = this.physics.add.group();

          // Ensure the paddle is a physics object and immovable
          this.paddle = this.physics.add
            .image(780, 500, "assets", "paddle")
            .setImmovable(true)
            .setCollideWorldBounds(true);

          // Create the ball with dynamic physics
          this.ball = this.physics.add.image(136, 1124, "assets", "ball").setCollideWorldBounds(true).setBounce(1, 1); // Ensure the ball bounces off world bounds and objects
          this.ball.setData("onPaddle", true); // set on paddle to true when inittially creating the ball
          this.ball.setBounce(1, 1); // Perfectly elastic collision

          // Our colliders
          // Set up collision between the ball and the aliens
          this.physics.add.collider(this.ball, this.aliens, this.hitAlien, null, this);
          // Set up collision between the ball and the paddle
          this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
          this.physics.add.collider(this.lasers, this.paddle, this.laserHitsPaddle, null, this);

          //make the ball not move with the cursor

          // Input events
          this.input.on(
            "pointermove",
            function (pointer) {
              // Keep the paddle within the game
              this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 1148);

              // Only set the ball's position to follow the paddle when it is on the paddle
              if (this.ball.getData("onPaddle")) {
                this.ball.x = this.paddle.x;
              }
            },
            this
          );

          this.input.on(
            "pointerup",
            function (pointer) {
              if (this.ball.getData("onPaddle")) {
                this.ball.setVelocity(-75, -300);
                this.ball.setData("onPaddle", false);
              }
            },
            this
          );

          // Aliens shooting
          this.time.addEvent({
            delay: 2000,
            callback: this.alienShoots,
            callbackScope: this,
            loop: true,
          });

          // Make the aliens move as a group
          this.aliens.children.iterate((alien) => {
            alien.setVelocityX(this.alienVelocityX);
          });


        update();
          if (this.ball.y > 600) {
            this.resetBall();
          }

          // Check if aliens should reverse direction
          let reverseDirection = false;
          this.aliens.children.iterate((alien) => {
            if (alien.body.velocity.x > 0 && alien.x >= 800 - alien.width / 2) {
              reverseDirection = true;
            } else if (alien.body.velocity.x < 0 && alien.x <= alien.width / 2) {
              reverseDirection = true;
            }
          });

          if (reverseDirection) {
            this.alienVelocityX *= -1; // Reverse direction
            this.aliens.children.iterate((alien) => {
              alien.setVelocityX(this.alienVelocityX);
              alien.y += 10; // Move down
            });
          }

        hitAlien(ball, alien);
          alien.disableBody(true, true); // This disables and hides the alien

          // Slightly increase the ball's velocity and invert its Y direction to ensure it moves away
          // Ensure the ball has a minimum Y-velocity to prevent sticking
          let newVelocityY = Math.abs(ball.body.velocity.y) < 150 ? -150 : -ball.body.velocity.y;

          ball.setVelocity(newVelocityY * 1.1);

          if (this.aliens.countActive() === 0) {
            this.resetLevel();
          }

        resetBall();
          this.ball.setVelocity(0);
          this.ball.setPosition(this.paddle.x, 500);
          this.ball.setData("onPaddle", true);
        

        resetLevel();
          this.resetBall();

          this.aliens.children.each((alien) => {
            alien.enableBody(false, 0, 0, true, true);
          });

          // Reset alien movement
          this.aliens.setVelocityX(50);
        

        alienShoots() ;
          const aliens = this.aliens.getChildren().filter((alien) => alien.active);
          if (aliens.length > 0) {
            const alien = Phaser.Utils.Array.GetRandom(aliens);
            if (alien) {
              const laser = this.lasers.create(alien.x, alien.y + 16, "assets", "monsterbullet").setVelocityY(200);

              // Ensure laser physics are properly initialized
              laser.setCollideWorldBounds(true);
              laser.body.onWorldBounds = true;
              // Add an event to destroy the laser when it goes off-screen
              this.physics.world.on("worldbounds", function (body, up, down, left, right) {
                if (down && body.gameObject === laser) {
                  laser.destroy();
                }
              });
            }
          }


        laserHitsPaddle(laser, paddle);
          console.log("Before disabling laser:", laser.active, laser.visible);
          laser.disableBody(true, true);

          console.log("After disabling laser:", laser.active, laser.visible);
          // Handle paddle hit by laser if needed, e.g., lose life, reset ball, etc.
    
    

      const config = {
        type: Phaser.WEBGL,
        width: 1200,
        height: 600,
        parent: "phaser-example",
        scene: [SpaceBreakout],
        physics: {
          default: "arcade",
          arcade: {
            fps: 120,
          },
        },
      };

      const game = new Phaser.Game(config);
