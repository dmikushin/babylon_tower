/**
 * BabylonTowerRenderer - класс для визуализации игры "Вавилонская Башня" в браузере.
 * Рендерит текущее состояние игры с использованием HTML5 Canvas.
 */
class BabylonTowerRenderer {
  /**
   * Создает новый экземпляр рендерера.
   * 
   * @param {BabylonTower} game - Экземпляр игры, которую нужно отрисовать.
   * @param {HTMLElement} container - DOM-элемент, в который будет добавлен холст.
   * @param {Object} options - Опции рендеринга (опционально).
   */
  constructor(game, container, options = {}) {
    this.game = game;
    this.container = container;
    
    // Параметры рендеринга со значениями по умолчанию
    this.options = {
      width: options.width || 600,
      height: options.height || 400,
      rodWidth: options.rodWidth || 10,
      rodHeight: options.rodHeight || 250,
      rodColor: options.rodColor || '#8B4513',
      baseHeight: options.baseHeight || 20,
      baseColor: options.baseColor || '#A52A2A',
      diskMaxWidth: options.diskMaxWidth || 120,
      diskHeight: options.diskHeight || 25,
      diskColors: options.diskColors || null, // Будет заполнено случайными цветами
      animationSpeed: options.animationSpeed || 300, // Скорость анимации в мс
      clickable: options.clickable !== undefined ? options.clickable : true,
      onMoveCallback: options.onMoveCallback || null // Callback для обновления счетчика ходов
    };
    
    // Создаем холст
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.container.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    
    // Создаем случайные цвета для дисков, если они не заданы
    if (!this.options.diskColors) {
      this.generateRandomDiskColors();
    }
    
    // Состояние выбора стержня (для интерактивности)
    this.selectedRod = null;
    
    // Инициализация обработчиков событий, если диски кликабельны
    if (this.options.clickable) {
      this.initEventHandlers();
    }
    
    // Первоначальная отрисовка
    this.render();
  }
  
  /**
   * Генерирует случайные цвета для дисков.
   */
  generateRandomDiskColors() {
    this.options.diskColors = [];
    const disksCount = this.game.getDisksCount();
    
    for (let i = 0; i < disksCount; i++) {
      // Генерируем яркие, хорошо различимые цвета
      const hue = Math.floor(Math.random() * 360); // Случайный оттенок в HSL
      const saturation = 70 + Math.floor(Math.random() * 30); // Высокая насыщенность
      const lightness = 40 + Math.floor(Math.random() * 30); // Средняя яркость
      
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      this.options.diskColors.push(color);
    }
  }
  
  /**
   * Инициализирует обработчики событий для интерактивности.
   */
  initEventHandlers() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Определяем, на какой стержень кликнули
      const rodWidth = this.options.width / this.game.getRodsCount();
      const clickedRod = Math.floor(x / rodWidth);
      
      if (this.selectedRod === null) {
        // Выбираем стержень, с которого будем брать диск
        if (this.game.rods[clickedRod].length > 0) {
          this.selectedRod = clickedRod;
          this.render(); // Перерисовываем с выделением
        }
      } else {
        // Пытаемся переместить диск с выбранного стержня на кликнутый
        if (clickedRod !== this.selectedRod) {
          const moved = this.game.move(this.selectedRod, clickedRod);
          if (moved) {
            // Если ход выполнен успешно, анимируем его
            this.animateMove(this.selectedRod, clickedRod);
            
            // Вызываем callback для обновления счетчика ходов
            if (this.options.onMoveCallback) {
              this.options.onMoveCallback(this.game.movesCount);
            }
          }
        }
        
        // В любом случае снимаем выделение
        this.selectedRod = null;
        this.render();
        
        // Проверяем, не завершена ли игра
        if (this.game.isGameCompleted()) {
          this.showCompletionMessage();
        }
      }
    });
  }
  
  /**
   * Отрисовывает текущее состояние игры.
   */
  render() {
    // Очищаем холст
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const state = this.game.getState();
    const rodsCount = this.game.getRodsCount();
    const rodSpacing = this.options.width / rodsCount;
    
    // Рисуем основание
    this.ctx.fillStyle = this.options.baseColor;
    this.ctx.fillRect(
      0, 
      this.canvas.height - this.options.baseHeight, 
      this.canvas.width, 
      this.options.baseHeight
    );
    
    // Рисуем стержни
    for (let i = 0; i < rodsCount; i++) {
      const rodX = rodSpacing * (i + 0.5) - this.options.rodWidth / 2;
      const rodY = this.canvas.height - this.options.baseHeight - this.options.rodHeight;
      
      // Если стержень выбран, рисуем его выделенным
      this.ctx.fillStyle = (i === this.selectedRod) 
        ? '#FFA500' // Оранжевый для выделения
        : this.options.rodColor;
      
      this.ctx.fillRect(
        rodX, 
        rodY, 
        this.options.rodWidth, 
        this.options.rodHeight
      );
      
      // Рисуем диски на стержне
      this.renderDisksOnRod(i, rodX, rodY, rodSpacing);
    }
  }
  
  /**
   * Отрисовывает диски на указанном стержне.
   * 
   * @param {number} rodIndex - Индекс стержня.
   * @param {number} rodX - X-координата стержня.
   * @param {number} rodY - Y-координата верхней части стержня.
   * @param {number} rodSpacing - Расстояние между стержнями.
   */
  renderDisksOnRod(rodIndex, rodX, rodY, rodSpacing) {
    const rod = this.game.rods[rodIndex];
    const disksCount = rod.length;
    
    // Максимальное значение размера диска (для масштабирования)
    const maxDiskSize = this.game.getDisksCount();
    
    for (let i = 0; i < disksCount; i++) {
      const diskSize = rod[i];
      const diskIndex = diskSize - 1; // Индекс для выбора цвета (0-индексированный)
      
      // Ширина диска пропорциональна его размеру
      const diskWidth = (diskSize / maxDiskSize) * this.options.diskMaxWidth;
      
      // Координаты для рисования диска
      const diskX = rodX + this.options.rodWidth / 2 - diskWidth / 2;
      const diskY = this.canvas.height - this.options.baseHeight - 
                   this.options.diskHeight * (i + 1);
      
      // Получаем цвет для диска
      const diskColor = this.options.diskColors[diskIndex];
      
      // Рисуем диск
      this.ctx.fillStyle = diskColor;
      this.ctx.beginPath();
      this.ctx.roundRect(
        diskX, 
        diskY, 
        diskWidth, 
        this.options.diskHeight, 
        [5, 5, 5, 5] // Скругленные углы
      );
      this.ctx.fill();
      
      // Рисуем окантовку диска для лучшей видимости
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Рисуем номер диска по центру
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        diskSize.toString(), 
        diskX + diskWidth / 2, 
        diskY + this.options.diskHeight / 2
      );
    }
  }
  
  /**
   * Анимирует перемещение диска с одного стержня на другой.
   * 
   * @param {number} fromRod - Индекс стержня, с которого снимается диск.
   * @param {number} toRod - Индекс стержня, на который помещается диск.
   */
  animateMove(fromRod, toRod) {
    // В будущем здесь можно реализовать анимацию перемещения диска
    // Для простоты сейчас просто перерисовываем состояние
    this.render();
  }
  
  /**
   * Показывает сообщение о завершении игры.
   */
  showCompletionMessage() {
    // Создаем элемент сообщения
    const messageEl = document.createElement('div');
    messageEl.textContent = `Поздравляем! Вы решили головоломку за ${this.game.movesCount} ходов.`;
    messageEl.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 128, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-size: 18px;
      font-family: Arial, sans-serif;
      text-align: center;
      z-index: 100;
    `;
    
    this.container.appendChild(messageEl);
    
    // Удаляем сообщение через 5 секунд
    setTimeout(() => {
      this.container.removeChild(messageEl);
    }, 5000);
  }
  
  /**
   * Обновляет игру, к которой привязан рендерер.
   * 
   * @param {BabylonTower} game - Новый экземпляр игры.
   */
  updateGame(game) {
    this.game = game;
    this.selectedRod = null;
    this.generateRandomDiskColors();
    this.render();
  }
}