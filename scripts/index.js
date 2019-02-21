$(function () {
    const canvas = document.getElementById('tetris');
    var context = canvas.getContext('2d');
    var cw = canvas.width
    var ch = canvas.height

    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height)

    $.getJSON("../assets/asset.json", function (json) {
        let spriteObj = {}
        let shapesArray = []
        spriteObj['json'] = json;

        let image = new Image();
        image.onload = function () {
            let shapes = spriteObj.json.frames
            for (let shape in shapes) {
                shapesArray.push(MakeShapeObject(shape))
            }
            function Draw(shapeobj, offset) {
                context.fillStyle = "#000"
                context.fillRect(0, 0, canvas.width, canvas.height)

                const { w, h, x, y } = shapeobj.frame;
                context.drawImage(image, x, y, w, h, offset.x, offset.y, w, h);
            }
            let offset = {
                x: 20,
                y: 20
            }
            let dropCounter = 0;
            let dropInterval = 1000;
            let lasttime = 0
            function update(time = 0) {
                const deltaTime = time - lasttime;
                lasttime = time;
                dropCounter += deltaTime;
                if (dropCounter > dropInterval) {
                    dropCounter = 0;
                    offset.y += 30;
                }

                Draw(shapes["animal_elephant.png"], offset);
                requestAnimationFrame(update);
            }

            update()
            function MakeShapeObject(shape) {
                switch (shape) {
                    case "animal_deer.png":
                        return {
                            matrix: [
                                [1, 1],
                                [1, 1]
                            ],
                            tag: "deer"
                        }
                    case "animal_chicken.png":
                        return {
                            matrix: [
                                [1, 1]
                            ],
                            tag: "chicken"
                        }
                    case "animal_crocodile.png":
                        return {
                            matrix: [
                                [0, 0],
                                [1, 1]
                            ],
                            tag: "crocodile"
                        }

                    case "animal_elephant.png":
                        return {
                            matrix: [
                                [1, 1],
                                [1, 1]
                            ],
                            tag: "elephant"
                        }
                    case "animal_fox.png":
                        return {
                            matrix: [
                                [1, 0],
                                [1, 1],
                            ],
                            tag: "fox"
                        }
                    case "animal_girafe.png":
                        return {
                            matrix: [
                                [0, 1, 0],
                                [0, 1, 0],
                                [0, 1, 0]
                            ],
                            tag: "girafe"
                        }
                    case "animal_panda.png":
                        return {
                            matrix: [
                                [1, 0]
                                [1, 0]
                            ],
                            tag: "panda"
                        }
                    case "bloc.png":
                        return {
                            matrix: [
                                [1]
                            ],
                            tag: "bloc"
                        }
                }
                if (shapeobj === "animal_crocodile.png") {
                    console.log(shapeobj)
                }


            }
        }
        image.src = "./assets/asset.png"
    });

});













