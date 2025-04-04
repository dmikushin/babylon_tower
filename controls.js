/**
 * Инициализация игры и настройка элементов управления.
 * Связывает пользовательский интерфейс с логикой игры.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов DOM
    const container = document.getElementById('game-container');
    const disksCountSelect = document.getElementById('disks-count');
    const rodsCountSelect = document.getElementById('rods-count');
    const resetButton = document.getElementById('reset-button');
    const moveCountElement = document.getElementById('move-count');
    
    // Создание начальной игры
    let game = new BabylonTower(
        parseInt(disksCountSelect.value), 
        parseInt(rodsCountSelect.value)
    );
    
    // Создание рендерера для визуализации игры
    let renderer = new BabylonTowerRenderer(game, container, {
        onMoveCallback: (moves) => {
            moveCountElement.textContent = moves;
        }
    });
    
    // Обработчик кнопки сброса
    resetButton.addEventListener('click', () => {
        const disksCount = parseInt(disksCountSelect.value);
        const rodsCount = parseInt(rodsCountSelect.value);
        
        game = new BabylonTower(disksCount, rodsCount);
        renderer.updateGame(game);
        moveCountElement.textContent = 0;
    });
    
    // Обновление игры при изменении настроек
    disksCountSelect.addEventListener('change', () => {
        resetButton.click();
    });
    
    rodsCountSelect.addEventListener('change', () => {
        resetButton.click();
    });
});