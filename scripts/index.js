$(function() {
  const canvas = document.getElementById("tetris");
  var context = canvas.getContext("2d");
  var cw = canvas.width;
  var ch = canvas.height;

  context.fillStyle = "#000";
  //context.scale(1.5, 1.5);
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "white";
  context.textAlign = "center";
  context.font = "20px Arial";
  context.fillText("Press P to start", cw / 2, ch / 2);

  $.getJSON("./assets/asset.json", function(json) {
    let image = new Image();
    let audio = new Audio("./music/music.ogg");
    audio.loop = true;
    image.onload = function() {
      let shapeArray = []; //to keep track of all the possible gameobjects
      let registeredObjects = []; //to keep track of all the gameobjects in the scene
      let currentObject = {}; //to keep track of the fired gameobject
      let blockSize = 30;
      let playerScore = 0;
      let shapes = json.frames;
      let isPause = true;
      let playField = CreateMatrix(10, 16);

      function Gameobject(shape) {
        const { w, h, x, y } = shapes[shape].frame;
        this.matrix = GetObjectMatrix(shape);
        let horizontalMargin = GetHorizontalMargin(shape);
        this.move = function() {
          if (this.belowItems.length === 0) {
            CleanElementPlayField(this);
            do {
              this.offset.y += blockSize;
            } while (!Collide(this));
            this.offset.y -= blockSize;
            Merge(this);
            CheckForSimilar(this);
            this.aboveItems.forEach(item => {
              console.log(this.aboveItems);
              let aboveObj = GetGameobjectById(item);
              let index = aboveObj.belowItems.indexOf(this.id);
              aboveObj.belowItems.splice(index, 1);
              aboveObj.move();
            });
          }
        };
        this.frame = {
          width: w,
          height: h,
          xPos: x,
          yPos: y
        };
        this.offset = {
          x: cw / 2 - blockSize,
          y: 0,
          e: horizontalMargin
        };
        this.rotation = 0;

        this.belowItems = [];
        this.aboveItems = [];

        this.id = "";
      }
      function Blockobject() {
        this.value = 0;
        this.id = "";
      }

      for (let shape in shapes) {
        shapeArray.push(shape);
      }

      function UpdateScore(unit) {
        playerScore += unit * 10;
        document.getElementById("score").innerText = playerScore;
      }

      function DrawGameobject(gameObject) {
        const { width, height, xPos, yPos } = gameObject.frame;
        const { x, y, e } = gameObject.offset;
        //console.log(x);
        let rotation = gameObject.rotation;
        if (rotation !== 0) {
          let margin = (blockSize * gameObject.matrix.length) / 2;
          context.save();
          context.translate(x + margin, y + margin);
          context.rotate((rotation * Math.PI) / 180);
          context.drawImage(
            image,
            xPos,
            yPos,
            width,
            height,
            -margin + e,
            -margin,
            width,
            height
          );
          context.translate(-(x + margin), -(y + margin));
          context.restore();
        } else {
          context.drawImage(
            image,
            xPos,
            yPos,
            width,
            height,
            x + e,
            y,
            width,
            height
          );
        }
      }

      function CreateMatrix(w, h) {
        const matrix = [];
        while (h--) {
          let row = new Array(w);
          for (let i = 0; i < w; i++) {
            row[i] = new Blockobject();
          }
          matrix.push(row);
        }

        return matrix;
      }
      function Merge(gameObject) {
        let shapeMatrix = gameObject.matrix;

        shapeMatrix.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              playField[y + gameObject.offset.y / blockSize][
                x + gameObject.offset.x / blockSize
              ].value = value;
              playField[y + gameObject.offset.y / blockSize][
                x + gameObject.offset.x / blockSize
              ].id = gameObject.id;
            }
          });
        });
      }
      function Collide(gameObject) {
        let shapeMatrix = gameObject.matrix;
        for (let y = 0; y < shapeMatrix.length; y++) {
          for (let x = 0; x < shapeMatrix[y].length; x++) {
            if (
              shapeMatrix[y][x] !== 0 &&
              (playField[y + gameObject.offset.y / blockSize] &&
                playField[y + gameObject.offset.y / blockSize][
                  x + gameObject.offset.x / blockSize
                ] &&
                playField[y + gameObject.offset.y / blockSize][
                  x + gameObject.offset.x / blockSize
                ].value) !== 0
            ) {
              return true;
            }
          }
        }
        return false;
      }

      function PlayerDrop() {
        currentObject.offset.y += blockSize;
        if (Collide(currentObject)) {
          currentObject.offset.y -= blockSize;
          Merge(currentObject);
          CheckForSimilar(currentObject);

          SpawnGameobject();

          //currentObject.offset.y = 0;
        }
        dropCounter = 0;
      }

      let dropCounter = 0;
      let dropInterval = 500;
      let lasttime = 0;
      function update(time = 0) {
        if (!isPause) {
          const deltaTime = time - lasttime;
          lasttime = time;
          dropCounter += deltaTime;
          if (dropCounter > dropInterval) {
            PlayerDrop();
          }
          Draw();
        }
        requestAnimationFrame(update);
      }

      function CheckForSimilar(gameObject) {
        let items = [];
        let selfId = "";
        let itemsToRemove = [];
        let shapeMatrix = gameObject.matrix;
        let offY = gameObject.offset.y / blockSize;
        let offX = gameObject.offset.x / blockSize;
        for (let y = 0; y < shapeMatrix.length; y++) {
          for (let x = 0; x < shapeMatrix[y].length; x++) {
            if (shapeMatrix[y][x] !== 0) {
              let selfValue = shapeMatrix[y][x];
              selfId = playField[y + offY][x + offX].id;

              let up = playField[y + offY - 1]
                ? playField[y + offY - 1][x + offX]
                : false;
              let right = playField[y + offY][x + offX + 1]
                ? playField[y + offY][x + offX + 1]
                : false;
              let down = playField[y + offY + 1]
                ? playField[y + offY + 1][x + offX]
                : false;
              let left = playField[y + offY][x + offX - 1]
                ? playField[y + offY][x + offX - 1]
                : false;
              //console.log(down);
              if (up && up.id !== selfId) {
                if (up.value === selfValue) items.push(up.id);
                else if (up.value !== selfValue && up.value !== 0) {
                  if (gameObject.aboveItems.indexOf(up.id) === -1)
                    gameObject.aboveItems.push(up.id);
                  let aboveObj = GetGameobjectById(up.id);
                  if (aboveObj.belowItems.indexOf(selfId) === -1)
                    aboveObj.belowItems.push(selfId);
                }
              }
              if (right && right.value === selfValue && right.id !== selfId) {
                items.push(right.id);
              }
              if (down && down.id !== selfId) {
                if (down.value === selfValue) items.push(down.id);
                else if (down.value !== selfValue && down.value !== 0) {
                  if (gameObject.belowItems.indexOf(down.id) === -1)
                    gameObject.belowItems.push(down.id); //we add Id of below object
                  let belowObj = GetGameobjectById(down.id);
                  if (belowObj.aboveItems.indexOf(selfId) === -1)
                    belowObj.aboveItems.push(selfId);
                }
              }
              if (left && left.value === selfValue && left.id !== selfId) {
                items.push(left.id);
              }
            }
          }
        }
        $.each(items, function(i, el) {
          if ($.inArray(el, itemsToRemove) === -1) itemsToRemove.push(el);
        });
        if (itemsToRemove.length > 0) itemsToRemove.push(selfId); //we add the object itself to the list when we have at least one item in the list.
        RemoveElements(itemsToRemove);
      }

      function RemoveElements(items) {
        items.forEach(id => {
          //Cleaning up the play field
          const gameObject = GetGameobjectById(id);
          CleanElementPlayField(gameObject);

          gameObject.belowItems.forEach((value, i) => {
            let belowObj = GetGameobjectById(value);
            let index = belowObj.aboveItems.indexOf(id);
            belowObj.aboveItems.splice(index, 1); //Removing this object from below objects' aboveItems
          });

          gameObject.aboveItems.forEach((value, i) => {
            let aboveObj = GetGameobjectById(value);
            let index = aboveObj.belowItems.indexOf(id);
            aboveObj.belowItems.splice(index, 1); //Removing this object from above objects' belowItems
            aboveObj.move();
          });
          UpdateScore(0.5);
          //We won't render them again
          registeredObjects = registeredObjects.filter(
            value => !value.hasOwnProperty(id)
          );
        });
      }

      function CleanElementPlayField(gameObject) {
        const shapeMatrix = gameObject.matrix;
        const { x: offX, y: offY } = gameObject.offset;
        shapeMatrix.forEach((row, y) => {
          row.forEach((value, x) => {
            if (shapeMatrix[y][x] !== 0)
              playField[y + offY / blockSize][
                x + offX / blockSize
              ] = new Blockobject();
          });
        });
      }

      function SpawnGameobject() {
        let random = Math.floor(Math.random() * Math.floor(shapeArray.length));
        currentObject = new Gameobject(shapeArray[random]);
        if (Collide(currentObject)) {
          Restart();
        }
        let newId = Math.random()
          .toString(36)
          .substring(7);
        currentObject.id = newId;
        RegisterObject(newId);
      }

      SpawnGameobject();
      // PlayAudio();
      update();

      function PlayAudio() {
        audio.play();
      }
      function StopAudio() {
        audio.pause();
      }

      function Restart() {
        registeredObjects = [];
        playField = CreateMatrix(10, 16);
        playerScore = 0;
        document.getElementById("score").innerText = 0;
      }

      function Draw() {
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        DrawScene();
        DrawGameobject(currentObject);
      }

      function RegisterObject(newId) {
        let object = new Object();
        object[newId] = currentObject;
        registeredObjects.push(object);
      }

      function GetGameobjectById(id) {
        let result = null;
        registeredObjects.forEach((value, index) => {
          if (value.hasOwnProperty(id)) {
            result = value[id];
          }
        });
        return result;
      }
      // window["GetGameobjectById"] = GetGameobjectById;
      window["registeredObjects"] = registeredObjects;

      function DrawScene() {
        playField.forEach((row, y) => {
          row.forEach((block, x) => {
            if (block.value !== 0) {
              let id = block.id;
              let gameObject = GetGameobjectById(id);
              if (gameObject) {
                DrawGameobject(gameObject);
              }
            }
          });
        });
      }

      function PlayerRotate(dir) {
        let pos = currentObject.matrix.x;
        let offset = blockSize;
        Rotate(dir);
        while (Collide(currentObject)) {
          currentObject.offset.x += offset;
          offset = -(offset + (offset > 0 ? blockSize : -blockSize));
          if (offset > currentObject.matrix[0].length * blockSize) {
            Rotate(-dir);
            currentObject.offset.x = pos;
            return;
          }
        }
      }

      function Rotate(dir) {
        shapeMatrix = currentObject.matrix;
        for (let y = 0; y < shapeMatrix.length; ++y) {
          for (let x = 0; x < y; ++x) {
            [shapeMatrix[x][y], shapeMatrix[y][x]] = [
              shapeMatrix[y][x],
              shapeMatrix[x][y]
            ];
          }
        }

        if (dir > 0) {
          currentObject.rotation += 90;
          shapeMatrix.forEach(row => row.reverse());
        } else {
          currentObject.rotation -= 90;
          shapeMatrix.reverse();
        }
      }

      function GetObjectMatrix(shape) {
        switch (shape) {
          case "animal_deer.png":
            return [[1, 1], [1, 0]];

          case "animal_chicken.png":
            return [[2]];

          case "animal_crocodile.png":
            return [[3, 3], [0, 0]];

          case "animal_elephant.png":
            return [[4, 4], [4, 4]];

          case "animal_fox.png":
            return [[5, 0], [5, 5]];

          case "animal_girafe.png":
            return [[0, 6, 0], [0, 6, 0], [0, 6, 0]];

          case "animal_panda.png":
            return [[7, 0], [7, 0]];

          case "bloc.png":
            return [[8]];
        }
      }
      function GetHorizontalMargin(shape) {
        if (shape === "animal_girafe.png") return blockSize;
        return 0;
      }

      function PlayerMove(dir) {
        currentObject.offset.x += dir * blockSize;
        if (Collide(currentObject)) {
          currentObject.offset.x -= dir * blockSize;
        }
      }
      function Pause() {
        isPause = true;
        StopAudio();
        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = "20px Arial";
        context.fillText("Pause", cw / 2, ch / 2);
      }
      function Resume() {
        audio.play();
        isPause = false;
      }

      document.addEventListener("keydown", event => {
        if (event.keyCode === 37) {
          PlayerMove(-1);
        } else if (event.keyCode === 39) {
          PlayerMove(1);
        } else if (event.keyCode === 40) {
          PlayerDrop();
        } else if (event.keyCode === 81) {
          PlayerRotate(-1);
        } else if (event.keyCode === 87) {
          PlayerRotate(1);
        } else if (event.keyCode === 80) {
          if (isPause) Resume();
          else Pause();
        }
      });
    };
    image.src = "./assets/asset.png";
  });
});
