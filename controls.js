/**
 * Инициализация игры и настройка элементов управления.
 * Связывает пользовательский интерфейс с логикой игры.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Проверка на мобильное устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Получение элементов DOM
    const container = document.getElementById('game-container');
    const disksCountSelect = document.getElementById('disks-count');
    const rodsCountSelect = document.getElementById('rods-count');
    const resetButton = document.getElementById('reset-button');
    const moveCountElement = document.getElementById('move-count');
    const keyboardInfoElement = document.getElementById('keyboard-info');

    // Настраиваем размеры контейнера для мобильных устройств
    if (isMobile) {
        // Ограничиваем максимальное количество дисков на мобильных устройствах для лучшей играбельности
        if (disksCountSelect.value > 5) {
            disksCountSelect.value = 5;
        }

        // Изменяем сообщение о клавиатуре для мобильных устройств
        if (keyboardInfoElement) {
            keyboardInfoElement.textContent = `Коснитесь стержня для выбора (сначала источник, затем назначение)`;
        }
    }

    // Создание начальной игры
    let game = new BabylonTower(
        parseInt(disksCountSelect.value),
        parseInt(rodsCountSelect.value)
    );

    // Создание рендерера для визуализации игры
    let renderer = new BabylonTowerRenderer(game, container, {
        // Настраиваем параметры рендеринга в зависимости от типа устройства
        width: isMobile ? window.innerWidth - 40 : 600,
        height: isMobile ? 300 : 400,
        diskMaxWidth: isMobile ? 80 : 120,
        diskHeight: isMobile ? 20 : 25,
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

    // Обработчик нажатий клавиш (только для десктопа)
    let selectedSourceRod = null;

    // Функция для обновления информации о клавишах
    function updateKeyboardInfo(rodsCount) {
        if (keyboardInfoElement) {
            if (isMobile) {
                keyboardInfoElement.textContent = `Коснитесь стержня для выбора (сначала источник, затем назначение)`;
            } else {
                keyboardInfoElement.textContent = `Используйте клавиши 1-${rodsCount} для выбора стержней (сначала источник, затем назначение)`;
            }
        }
    }

    // Инициализация информации о клавишах при загрузке страницы
    updateKeyboardInfo(game.getRodsCount());

    // Добавляем обработчик клавиш только для десктопа
    if (!isMobile) {
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
    }

    // Обработка изменения ориентации для мобильных устройств
    window.addEventListener('resize', () => {
        if (renderer) {
            renderer.resizeCanvas();
        }
    });

    // Предотвращаем двойной тап для зума на мобильных устройствах
    if (isMobile) {
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;

            if (this.lastTap && (now - this.lastTap) < DOUBLE_TAP_DELAY) {
                e.preventDefault();
            }

            this.lastTap = now;
        }, {passive: false});

        // Отключаем долгое нажатие для вызова контекстного меню
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('#game-container')) {
                e.preventDefault();
                return false;
            }
        });
    }
});
