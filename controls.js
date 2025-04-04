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
    const keyboardInfoElement = document.getElementById('keyboard-info');
    
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
        
        // Обновляем информацию о клавишах
        updateKeyboardInfo(rodsCount);
    });
    
    // Обновление игры при изменении настроек
    disksCountSelect.addEventListener('change', () => {
        resetButton.click();
    });
    
    rodsCountSelect.addEventListener('change', () => {
        resetButton.click();
    });
    
    // Обработчик нажатий клавиш
    let selectedSourceRod = null;
    
    // Функция для обновления информации о клавишах
    function updateKeyboardInfo(rodsCount) {
        if (keyboardInfoElement) {
            keyboardInfoElement.textContent = `Используйте клавиши 1-${rodsCount} для выбора стержней (сначала источник, затем назначение)`;
        }
    }
    
    // Инициализация информации о клавишах при загрузке страницы
    updateKeyboardInfo(game.getRodsCount());
    
    document.addEventListener('keydown', (event) => {
        // Проверяем, что нажата цифровая клавиша
        const key = event.key;
        if (/^[1-9]$/.test(key)) {
            const rodIndex = parseInt(key) - 1; // Преобразуем клавишу 1-9 в индекс 0-8
            
            // Проверяем, что индекс не выходит за пределы доступных стержней
            if (rodIndex < game.getRodsCount()) {
                if (selectedSourceRod === null) {
                    // Выбираем стержень-источник
                    if (game.rods[rodIndex].length > 0) {
                        selectedSourceRod = rodIndex;
                        renderer.selectedRod = rodIndex;
                        renderer.render();
                        console.log(`Выбран стержень-источник: ${rodIndex + 1}`);
                    } else {
                        console.log(`Стержень ${rodIndex + 1} пуст. Выберите другой стержень.`);
                    }
                } else {
                    // Выбираем стержень-назначение и выполняем ход
                    if (selectedSourceRod !== rodIndex) {
                        const moved = game.move(selectedSourceRod, rodIndex);
                        if (moved) {
                            console.log(`Перемещаем диск со стержня ${selectedSourceRod + 1} на стержень ${rodIndex + 1}`);
                            renderer.animateMove(selectedSourceRod, rodIndex);
                            
                            // Вызываем callback для обновления счетчика ходов
                            moveCountElement.textContent = game.movesCount;
                            
                            // Проверяем, не завершена ли игра
                            if (game.isGameCompleted()) {
                                renderer.showCompletionMessage();
                            }
                        } else {
                            console.log(`Недопустимый ход со стержня ${selectedSourceRod + 1} на стержень ${rodIndex + 1}`);
                        }
                    } else {
                        console.log(`Отмена выбора стержня ${selectedSourceRod + 1}`);
                    }
                    
                    // В любом случае сбрасываем выбранный стержень
                    selectedSourceRod = null;
                    renderer.selectedRod = null;
                    renderer.render();
                }
            }
        }
    });
});
