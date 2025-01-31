;(function (win, doc) {
    win.$ = function (el) {
        return /^#\S+/.test(el) ? doc.querySelector(el) : doc.querySelectorAll(el);
    }
    win.Game = function (id) {
        this.canvas = $(id);
        this.ctx = this.canvas.getContext('2d');
        this.mapWidth = this.canvas.width;
        this.mapHeight = this.canvas.height;
    }
    Game.prototype = {
        score: 0, // 得分
        isWin: false,
        isOver: false,
        cols: 4, // 列数
        rows: 4, // 行数
        spacing: 15, // 方格之间的间距
        grids: [], // 方格对象数组
        bgColors: { // 方格背景色
            0: '#ccc0b3', 2: '#eee3da', 4: '#ede0c8', 8: '#f2b179',
            16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72',
            256: '#edcc61', 512: '#9c0', 1024: '#33b5e5', 2048: '#09c',
            4096: '#a6c', 8192: '#93c'
        },
        // 初始化
        init: function () {
            this.score = 0;
            this.isWin = false;
            this.isOver = false;
            // 计算小方块宽度
            this.width = (this.mapWidth - (this.cols + 1) * this.spacing) / this.cols;
            // 计算小方块高度
            this.height = (this.mapHeight - (this.rows + 1) * this.spacing) / this.rows;
            // 初始化方块数组
            for (var row = 0; row < this.rows; row++) {
                this.grids[row] = [];
                for (var col = 0; col < this.cols; col++) {
                    var x = col * this.width + this.spacing * (col + 1);
                    var y = row * this.height + this.spacing * (row + 1);
                    this.grids[row][col] = {
                        num: 0,
                        x: x,
                        y: y
                    };
                }
            }
            this.random();
            this.random();
            this.draw();
            this.updateScore();
        },
        // 开始游戏
        start: function () {
            var self = this;
            self.init();
            doc.onkeydown = function (e) { // 绑定按键点击事件
                if (this.isWin || this.isOver) {
                    return false;
                }
                switch (e.keyCode) { // 判断按键
                    case 37: // left
                        self.dir = 3;
                        self.moveLeft();
                        break;
                    case 38: // up
                        self.dir = 1;
                        self.moveUp();
                        break;
                    case 39: // right
                        self.dir = 4;
                        self.moveRight();
                        break;
                    case 40: // down
                        self.dir = 2;
                        self.moveDown();
                        break;
                }
                self.updateScore();
            };
        },
        // 随机生成数字
        random: function () {
            while (1) {
                var row = Math.floor(Math.random() * this.rows);
                var col = Math.floor(Math.random() * this.cols);
                // 当前方块的值必须是0，才能生成新的值
                if (this.grids[row][col].num === 0) {
                    // 生成2和4的概率比例是 3:2
                    this.grids[row][col].num = (Math.random() >= 0.6) ? 4 : 2;
                    break;
                }
            }
        },
        // 更新分数显示
        updateScore() {
            $('#score').innerText = this.score;
        },
        // 判断游戏结束
        isGameOver: function () {
            for (var row = 0; row < this.rows; row++) {
                for (var col = 0; col < this.cols; col++) {
                    if (this.grids[row][col].num === 0) {
                        return false;
                    } else if (col != this.cols - 1 && this.grids[row][col].num === this.grids[row][col + 1].num) {
                        return false;
                    } else if (row != this.rows - 1 && this.grids[row][col].num === this.grids[row + 1][col].num) {
                        return false;
                    }
                }
            }
            return true;
        },
        // 查找下一个不为0的数值的位置
        find: function (row, col, start, condition) {
            if (this.dir === 1) { // up
                for (var f = start; f < condition; f += 1) {
                    if (this.grids[f][col].num != 0) {
                        return f;
                    }
                }
            } else if (this.dir === 2) { // down
                for (var f = start; f >= condition; f += -1) {
                    if (this.grids[f][col].num != 0) {
                        return f;
                    }
                }
            } else if (this.dir === 3) { // left
                for (var f = start; f < condition; f += 1) {
                    if (this.grids[row][f].num != 0) {
                        return f;
                    }
                }
            } else if (this.dir === 4) { // right
                for (var f = start; f >= condition; f += -1) {
                    if (this.grids[row][f].num != 0) {
                        return f;
                    }
                }
            }
            return null;
        },
        // 方块的移动
        move: function (itertor) {
            var before, // 没处理前
                after; // 处理后
            before = this.gridsToString(this.grids);
            itertor(); //执行for函数
            after = this.gridsToString(this.grids);
            if (before != after) { // 前后对比，如果不同就update
                this.random();
                this.draw();
            }
        },
        // 处理左按键事件
        moveLeft: function () {
            var self = this;
            this.move(function () {
                for (var row = 0; row < self.rows; row++) {
                    var next;
                    for (var col = 0; col < self.cols; col++) {
                        next = self.find(row, col, col + 1, self.cols); // 找出第一个不为0的位置
                        if (next == null) {
                            break; // 没有找到就返回
                        }
                        // 如果当前位置为0
                        if (self.grids[row][col].num === 0) {
                            self.grids[row][col].num = self.grids[row][next].num; // 把找到的不为0的数值替换为当前位置的值
                            self.grids[row][next].num = 0; //找到的位置清0
                            col--; // 再次循环多一次，查看后面否有值与替换后的值相同，
                        } else if (self.grids[row][col].num === self.grids[row][next].num) { // 如果当前位置与找到的位置数值相等，则相加
                            self.grids[row][col].num *= 2;
                            self.grids[row][next].num = 0;
                            self.score += self.grids[row][col].num;
                        }
                    }
                }
            });
        },
        // 处理右按键事件
        moveRight: function () {
            var self = this;
            this.move(function () {
                for (var row = 0; row < self.rows; row++) {
                    var next;
                    for (var col = self.cols - 1; col >= 0; col--) {
                        next = self.find(row, col, col - 1, 0); //找出第一个不为0的位置
                        if (next == null) {
                            break; //没有找到就返回
                        }
                        //如果当前位置为0
                        if (self.grids[row][col].num === 0) {
                            self.grids[row][col].num = self.grids[row][next].num; //把找到的不为0的数值替换为当前位置的值
                            self.grids[row][next].num = 0; //找到的位置清0
                            col++; //再次循环多一次，查看后面否有值与替换后的值相同，
                        } else if (self.grids[row][col].num === self.grids[row][next].num) { //如果当前位置与找到的位置数值相等，则相加
                            self.grids[row][col].num *= 2;
                            self.grids[row][next].num = 0;
                            self.score += self.grids[row][col].num;
                        }
                    }
                }
            });
        },
        // 处理上按键事件
        moveUp: function () {
            var self = this;
            this.move(function () {
                for (var col = 0; col < self.cols; col++) {
                    var next;
                    for (var row = 0; row < self.rows; row++) {
                        next = self.find(row, col, row + 1, self.rows); // 找出第一个不为0的位置
                        if (next == null) {
                            break;
                        }
                        // 如果当前位置为0
                        if (self.grids[row][col].num === 0) {
                            self.grids[row][col].num = self.grids[next][col].num; // 把找到的不为0的数值替换为当前位置的值
                            self.grids[next][col].num = 0; // 找到的位置清0
                            row--; // 再次循环多一次，查看后面否有值与替换后的值相同
                        } else if (self.grids[row][col].num == self.grids[next][col].num) { // 如果当前位置与找到的位置数值相等，则相加
                            self.grids[row][col].num *= 2;
                            self.grids[next][col].num = 0;
                            self.score += self.grids[row][col].num;
                        }
                    }
                }
            });
        },
        // 处理下按键事件
        moveDown: function () {
            var self = this;
            this.move(function () {
                for (var col = 0; col < self.cols; col++) {
                    var next;
                    for (var row = self.rows - 1; row >= 0; row--) {
                        next = self.find(row, col, row - 1, 0); // 找出第一个不为0的位置
                        if (next == null) {
                            break;
                        }
                        // 如果当前位置为0
                        if (self.grids[row][col].num === 0) {
                            self.grids[row][col].num = self.grids[next][col].num; // 把找到的不为0的数值替换为当前位置的值
                            self.grids[next][col].num = 0; // 找到的位置清0
                            row++; // 再次循环多一次，查看后面否有值与替换后的值相同
                        } else if (self.grids[row][col].num === self.grids[next][col].num) { // 如果当前位置与找到的位置数值相等，则相加
                            self.grids[row][col].num *= 2;
                            self.grids[next][col].num = 0;
                            self.score += self.grids[row][col].num;
                        }
                    }
                }
            });
        },
        // 绘制游戏内容
        draw: function () {
            // 清空原有内容
            this.ctx.clearRect(0, 0, this.mapWidth, this.mapHeight);
            for (var row = 0; row < this.rows; row++) {
                for (var col = 0; col < this.cols; col++) {
                    var x = this.grids[row][col].x; // 得到方块x坐标
                    var y = this.grids[row][col].y; // 得到方块y坐标
                    var num = this.grids[row][col].num; // 得到方块数字
                    var bgColor = this.bgColors[num]; // 得到方块背景色
                    // 绘制方块
                    this.fillRoundRect(this.ctx, x, y, this.width, this.height, 10, bgColor);
                    if (num > 0) { // 只有方块数字大于0才绘制数字
                        // 绘制方块的数字
                        this.fillText(this.ctx, num, x + this.width / 2, y + this.height / 2, this.width - 20, num <= 4 ? '#776e65' : '#fff');
                    }
                    // 判断是否胜利
                    if (this.rows === 3 && num === 1024) {
                        this.isWin = true;
                    }
                    if (this.rows === 4 && num === 2048) {
                        this.isWin = true;
                    }
                    if (this.rows === 5 && num === 4096) {
                        this.isWin = true;
                    }
                    if (this.rows === 6 && num === 8192) {
                        this.isWin = true;
                    }
                }
            }
            if (this.isWin) { // 胜利
                $('#state').innerHTML = '你胜利了<br>分数:<br>' + this.score;
                $('#state').style.color = 'green';
                $('#game-over').style.display = 'block';
            }
            if (this.isGameOver()) { // 失败
                this.isOver = true;
                $('#state').innerHTML = '游戏失败<br>分数:<br>' + this.score;
                $('#state').style.color = 'red';
                $('#game-over').style.display = 'block';
            }
        },
        // 绘制文字
        fillText(ctx, text, x, y, maxWidth, fillColor) {
            ctx.fillStyle = fillColor || "#000"; // 设置画笔颜色
            ctx.font = "bold 40px '微软雅黑'"; // 设置字体
            ctx.textAlign = 'center'; // 水平居中
            ctx.textBaseline = "middle"; // 垂直居中
            ctx.fillText(text, x, y, maxWidth);
        },
        // 绘制并填充圆角矩形
        fillRoundRect: function (ctx, x, y, width, height, radius, fillColor) {
            // 圆的直径必然要小于矩形的宽高
            if (2 * radius > width || 2 * radius > height) {
                return false;
            }
            ctx.save();
            ctx.translate(x, y);
            // 绘制圆角矩形的各个边
            this.drawRoundRectPath(ctx, width, height, radius);
            ctx.fillStyle = fillColor || "#000"; // 设置画笔颜色
            ctx.fill();
            ctx.restore();
        },
        // 绘制圆角矩形框
        drawRoundRectPath: function (ctx, width, height, radius) {
            ctx.beginPath(0);
            // 从右下角顺时针绘制，弧度从0到1/2PI
            ctx.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
            // 矩形下边线
            ctx.lineTo(radius, height);
            // 左下角圆弧，弧度从1/2PI到PI
            ctx.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
            // 矩形左边线
            ctx.lineTo(0, radius);
            // 左上角圆弧，弧度从PI到3/2PI
            ctx.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);
            // 上边线
            ctx.lineTo(width - radius, 0);
            // 右上角圆弧
            ctx.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);
            // 右边线
            ctx.lineTo(width, height - radius);
            ctx.closePath();
        },
        // grids数组转成string
        gridsToString: function (grids) {
            var s = '[';
            for (var i in grids) {
                if (Object.prototype.toString.call(grids[i]) === '[object Array]') {
                    s += this.gridsToString(grids[i]);
                } else if (Object.prototype.toString.call(grids[i]) === '[object Object]') {
                    s += JSON.stringify(grids[i]);
                } else {
                    s += grids[i];
                }
            }
            s += ']';
            return s;
        }
    };
})(window, document);

var game = new Game('#canvas');
game.start();

$('#mode').onchange = function () {
    game.rows = game.cols = $('#mode').value / 1;
    game.init();
    $('#mode').blur();
}

$('#again').onclick = function () {
    $('#game-over').style.display = 'none';
    game.init();
}