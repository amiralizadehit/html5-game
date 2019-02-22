$(function() {
  const canvas = document.getElementById("tetris");
  var context = canvas.getContext("2d");
  var cw = canvas.width;
  var ch = canvas.height;

  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  $.getJSON("../assets/asset.json", function(json) {
    let image = new Image();
    image.onload = function() {
      let shapeArray = []; //to keep track of all the possible gameobjects
      let registeredObjects = []; //to keep track of all the gameobjects in the scene
      let currentObject = {}; //to keep track of the fired gameobject
      let blockSize = 30;
      let shapes = json.frames;

      function Gameobject(shape) {
        const { w, h, x, y } = shapes[shape].frame;
        this.matrix = GetObjectMatrix(shape);
        let horizontalMargin = GetHorizontalMargin(shape);
        this.frame = {
          width: w,
          height: h,
          xPos: x,
          yPos: y
        };
        this.offset = {
          x: 0,
          y: 0,
          e: horizontalMargin
        };
        this.id = "";
      }
      function Blockobject() {
        this.value = 0;
        this.id = "";
      }

      for (let shape in shapes) {
        shapeArray.push(shape);
      }

      function DrawGameobject(gameObject) {
        const { width, height, xPos, yPos } = gameObject.frame;
        const { x, y, e } = gameObject.offset;
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

      const playField = CreateMatrix(8, 14);

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
      function Merge() {
        let shapeMatrix = currentObject.matrix;

        shapeMatrix.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              playField[y + currentObject.offset.y / blockSize][
                x + currentObject.offset.x / blockSize
              ].value = value;
              playField[y + currentObject.offset.y / blockSize][
                x + currentObject.offset.x / blockSize
              ].id = currentObject.id;
            }
          });
        });
      }
      function Collide() {
        let shapeMatrix = currentObject.matrix;
        for (let y = 0; y < shapeMatrix.length; y++) {
          for (let x = 0; x < shapeMatrix[y].length; x++) {
            if (
              shapeMatrix[y][x] !== 0 &&
              (playField[y + currentObject.offset.y / blockSize] &&
                playField[y + currentObject.offset.y / blockSize][
                  x + currentObject.offset.x / blockSize
                ] &&
                playField[y + currentObject.offset.y / blockSize][
                  x + currentObject.offset.x / blockSize
                ].value) !== 0
            ) {
              return true;
            }
          }
        }
        return false;
      }

      window["Merge"] = Merge; //temp
      //window["gameObjects"] = gameObjects; //temp
      window["playField"] = playField; //temp

      function PlayerDrop() {
        currentObject.offset.y += blockSize;
        if (Collide()) {
          currentObject.offset.y -= blockSize;
          Merge();
          SpawnGameobject();
          //currentObject.offset.y = 0;
        }
        dropCounter = 0;
      }

      let dropCounter = 0;
      let dropInterval = 1000;
      let lasttime = 0;
      function update(time = 0) {
        const deltaTime = time - lasttime;
        lasttime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
          PlayerDrop();
        }
        Draw();
        //
        //let test = GetGameobjectById(currentObject.id);

        requestAnimationFrame(update);
      }

      function SpawnGameobject() {
        let random = Math.floor(Math.random() * Math.floor(shapeArray.length));
        currentObject = new Gameobject(shapeArray[random]);
        let newId = Math.random()
          .toString(36)
          .substring(7);
        currentObject.id = newId;
        RegisterObject(newId);
      }

      window["currentObj"] = currentObject; //temp
      SpawnGameobject();
      update();

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
        let result = {};
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
              DrawGameobject(gameObject);
            }
          });
        });
      }

      function Rotate(dir) {
        shapeMatrix = currentObject.matrix;
        for (let y = 0; y < shapeMatrix.length; y++) {}
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
        if (Collide()) {
          currentObject.offset.x -= dir * blockSize;
        }
      }

      document.addEventListener("keydown", event => {
        if (event.keyCode === 37) {
          PlayerMove(-1);
        } else if (event.keyCode === 39) {
          PlayerMove(1);
        } else if (event.keyCode === 40) {
          PlayerDrop();
        }
      });
    };
    image.src = "./assets/asset.png";
  });
});
