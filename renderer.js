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

    // Инициализация обработчиков событий
    if (this.options.clickable) {
      this.initEventHandlers();
    }

    // Адаптивный размер канваса для мобильных устройств
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Первоначальная отрисовка
    this.render();
  }

  /**
   * Изменяет размер холста в зависимости от размера экрана.
   */
  resizeCanvas() {
    const containerWidth = this.container.clientWidth;
    const scaleFactor = Math.min(1, containerWidth / this.options.width);

    // Адаптивные размеры для мобильных устройств
    const isMobile = window.innerWidth <= 480;

    if (isMobile) {
      // Для мобильных устройств уменьшаем высоту канваса и других элементов
      const mobileHeight = Math.min(350, window.innerHeight * 0.5);
      this.canvas.style.width = `${containerWidth}px`;
      this.canvas.style.height = `${mobileHeight}px`;

      // Также уменьшаем размеры элементов для отрисовки
      this.options.diskMaxWidth = Math.min(80, containerWidth / this.game.getRodsCount() * 0.8);
      this.options.diskHeight = Math.min(20, mobileHeight / (this.game.getDisksCount() + 2));
      this.options.rodHeight = mobileHeight * 0.8;
    } else {
      // Для десктопа сохраняем пропорции
      this.canvas.style.width = `${this.options.width * scaleFactor}px`;
      this.canvas.style.height = `${this.options.height * scaleFactor}px`;

      // Восстанавливаем стандартные размеры
      this.options.diskMaxWidth = 120;
      this.options.diskHeight = 25;
      this.options.rodHeight = 250;
    }

    // Перерисовываем игру с новыми размерами
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
    // Функция обработки взаимодействия (для мыши и касания)
    const handleInteraction = (e) => {
      e.preventDefault();

      const rect = this.canvas.getBoundingClientRect();
      // Получаем координаты как для мыши, так и для касания
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;

      // Определяем, на какой стержень кликнули/коснулись
      const rodWidth = rect.width / this.game.getRodsCount();
      const clickedRod = Math.floor(x / rodWidth);

      if (this.selectedRod === null) {
        // Выбираем стержень, с которого будем брать диск
        if (clickedRod < this.game.getRodsCount() && this.game.rods[clickedRod].length > 0) {
          this.selectedRod = clickedRod;
          this.render(); // Перерисовываем с выделением
          console.log(`Выбран стержень-источник: ${clickedRod + 1}`);
        }
      } else {
        // Пытаемся переместить диск с выбранного стержня на кликнутый
        if (clickedRod < this.game.getRodsCount() && clickedRod !== this.selectedRod) {
          const moved = this.game.move(this.selectedRod, clickedRod);
          if (moved) {
            console.log(`Перемещаем диск со стержня ${this.selectedRod + 1} на стержень ${clickedRod + 1}`);
            this.animateMove(this.selectedRod, clickedRod);

            // Вызываем callback для обновления счетчика ходов
            if (this.options.onMoveCallback) {
              this.options.onMoveCallback(this.game.movesCount);
            }

            // Проверяем, не завершена ли игра
            if (this.game.isGameCompleted()) {
              this.showCompletionMessage();
            }
          } else {
            console.log(`Недопустимый ход со стержня ${this.selectedRod + 1} на стержень ${clickedRod + 1}`);
          }
        }

        // В любом случае снимаем выделение
        this.selectedRod = null;
        this.render();
      }
    };

    // Добавляем обработчики для мыши и касания
    this.canvas.addEventListener('click', handleInteraction);
    this.canvas.addEventListener('touchstart', handleInteraction);

    // Предотвращаем зум при двойном касании на мобильных устройствах
    this.canvas.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        e.preventDefault();
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

    // Определяем, используем ли мобильный режим
    const isMobile = window.innerWidth <= 480;

    // Настраиваем размеры для адаптивности
    const canvasRect = this.canvas.getBoundingClientRect();
    const displayWidth = canvasRect.width;
    const displayHeight = canvasRect.height;
    const scaleFactor = displayWidth / this.options.width;

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

    // Определяем, используем ли мобильный режим
    const isMobile = window.innerWidth <= 480;

    // Настраиваем размер шрифта для мобильных устройств
    const fontSize = isMobile ? 12 : 16;

    for (let i = 0; i < disksCount; i++) {
      const diskSize = rod[i];
      const diskIndex = diskSize - 1; // Индекс для выбора цвета (0-индексированный)

      // Ширина диска пропорциональна его размеру и адаптирована для мобильных
      const diskWidthRatio = isMobile ? 0.7 : 1.0; // Уменьшаем размер для мобильных
      const diskWidth = (diskSize / maxDiskSize) * this.options.diskMaxWidth * diskWidthRatio;

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
      this.ctx.font = `${fontSize}px Arial`;
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

    // Адаптивный размер шрифта и отступы
    const isMobile = window.innerWidth <= 480;
    const fontSize = isMobile ? '16px' : '18px';
    const padding = isMobile ? '15px' : '20px';

    messageEl.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 128, 0, 0.9);
      color: white;
      padding: ${padding};
      border-radius: 10px;
      font-size: ${fontSize};
      font-family: Arial, sans-serif;
      text-align: center;
      z-index: 100;
      max-width: 90%;
    `;

    this.container.appendChild(messageEl);

    // Добавим кнопку "OK" для закрытия на мобильных устройствах
    if (isMobile) {
      const closeButton = document.createElement('button');
      closeButton.textContent = 'OK';
      closeButton.style.cssText = `
        margin-top: 10px;
        padding: 5px 15px;
        background-color: white;
        color: green;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        cursor: pointer;
        display: block;
        margin-left: auto;
        margin-right: auto;
      `;

      closeButton.addEventListener('click', () => {
        this.container.removeChild(messageEl);
      });

      messageEl.appendChild(closeButton);
    } else {
      // На десктопе убираем автоматически через 5 секунд
      setTimeout(() => {
        if (messageEl.parentNode === this.container) {
          this.container.removeChild(messageEl);
        }
      }, 5000);
    }
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
    this.resizeCanvas();
    this.render();
  }
}
