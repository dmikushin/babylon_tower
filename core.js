/**
 * Класс BabylonTower - ядро игры "Вавилонская Башня".
 * Реализует логику игры, хранит текущее состояние и проверяет правила.
 */
class BabylonTower {
  /**
   * Инициализация игры с заданным количеством дисков и стержней.
   * 
   * @param {number} numDisks - Количество дисков (по умолчанию 3).
   * @param {number} numRods - Количество стержней (по умолчанию 3).
   */
  constructor(numDisks = 3, numRods = 3) {
    this.numDisks = numDisks;
    this.numRods = numRods;
    
    // Инициализация стержней. Изначально все диски на первом стержне.
    this.rods = Array(numRods).fill().map(() => []);
    
    // Заполняем первый стержень дисками, размеры в порядке убывания снизу вверх
    for (let diskSize = numDisks; diskSize > 0; diskSize--) {
      this.rods[0].push(diskSize);
    }
    
    // Счетчик ходов
    this.movesCount = 0;
  }
  
  /**
   * Получить текущее состояние игры.
   * 
   * @returns {Array} Список стержней с дисками.
   */
  getState() {
    return this.rods.map(rod => [...rod]);
  }
  
  /**
   * Получить верхний диск с указанного стержня.
   * 
   * @param {number} rodIndex - Индекс стержня.
   * @returns {number|null} Размер верхнего диска или null, если стержень пустой.
   */
  getTopDisk(rodIndex) {
    if (this.rods[rodIndex].length === 0) {
      return null;
    }
    return this.rods[rodIndex][this.rods[rodIndex].length - 1];
  }
  
  /**
   * Проверка, является ли ход допустимым по правилам игры.
   * 
   * @param {number} fromRod - Индекс стержня, с которого снимается диск.
   * @param {number} toRod - Индекс стержня, на который помещается диск.
   * @returns {boolean} True, если ход допустим, иначе False.
   */
  isValidMove(fromRod, toRod) {
    // Проверка существования стержней
    if (fromRod < 0 || fromRod >= this.numRods || toRod < 0 || toRod >= this.numRods) {
      return false;
    }
    
    // Проверка, что снимаем не с пустого стержня
    if (this.rods[fromRod].length === 0) {
      return false;
    }
    
    // Проверка правила: диск можно положить только на больший диск или на пустой стержень
    const topDiskFrom = this.getTopDisk(fromRod);
    const topDiskTo = this.getTopDisk(toRod);
    
    if (topDiskTo === null || topDiskFrom < topDiskTo) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Выполнить перемещение диска с одного стержня на другой.
   * 
   * @param {number} fromRod - Индекс стержня, с которого снимается диск.
   * @param {number} toRod - Индекс стержня, на который помещается диск.
   * @returns {boolean} True, если ход выполнен успешно, иначе False.
   */
  move(fromRod, toRod) {
    if (!this.isValidMove(fromRod, toRod)) {
      return false;
    }
    
    // Выполняем перемещение диска
    const disk = this.rods[fromRod].pop();
    this.rods[toRod].push(disk);
    
    // Увеличиваем счетчик ходов
    this.movesCount++;
    
    return true;
  }
  
  /**
   * Проверка, завершена ли игра (все диски перемещены на последний стержень).
   * 
   * @returns {boolean} True, если игра завершена, иначе False.
   */
  isGameCompleted() {
    // Игра завершена, если последний стержень содержит все диски
    return this.rods[this.numRods - 1].length === this.numDisks;
  }
  
  /**
   * Получить список всех возможных ходов в текущем состоянии.
   * 
   * @returns {Array} Список массивов [fromRod, toRod], представляющих возможные ходы.
   */
  getPossibleMoves() {
    const possibleMoves = [];
    
    for (let fromRod = 0; fromRod < this.numRods; fromRod++) {
      for (let toRod = 0; toRod < this.numRods; toRod++) {
        if (fromRod !== toRod && this.isValidMove(fromRod, toRod)) {
          possibleMoves.push([fromRod, toRod]);
        }
      }
    }
    
    return possibleMoves;
  }
  
  /**
   * Получить общее количество дисков в игре.
   * 
   * @returns {number} Количество дисков.
   */
  getDisksCount() {
    return this.numDisks;
  }
  
  /**
   * Получить количество стержней в игре.
   * 
   * @returns {number} Количество стержней.
   */
  getRodsCount() {
    return this.numRods;
  }
  
  /**
   * Строковое представление текущего состояния игры.
   * 
   * @returns {string} Строковое представление игры.
   */
  toString() {
    const result = [];
    for (let i = 0; i < this.rods.length; i++) {
      const rodStr = `Стержень ${i}: ${this.rods[i].join(' ')}`;
      result.push(rodStr);
    }
    return result.join('\n');
  }
}