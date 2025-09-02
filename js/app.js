document.addEventListener("DOMContentLoaded", function() {
    const classSelect = document.getElementById("class");
    const classBtns = document.querySelectorAll('.class-btn');
    // Обработка выбора класса через кнопки
    if (classBtns && classBtns.length) {
        classBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                classBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                classSelect.value = btn.getAttribute('data-class');
            });
        });
        // По умолчанию выделить первую кнопку
        classBtns[0].classList.add('selected');
        classSelect.value = classBtns[0].getAttribute('data-class');
    }
    const startTestBtn = document.getElementById("startTest");
    const testDiv = document.getElementById("test");
    const questionsDiv = document.getElementById("questions");
    const resultDiv = document.getElementById("result");
    const scoreP = document.getElementById("score");
    const phoneInput = document.getElementById("phone");
    const savePhoneBtn = document.getElementById("savePhone");

    // Кнопка "Показать результат"
    let showResultBtn = document.createElement("button");
    showResultBtn.textContent = "Показать результат";
    showResultBtn.style.display = "none";
    showResultBtn.style.marginTop = "20px";
    testDiv.appendChild(showResultBtn);

    let currentTest = null;
    let answers = [];
    let testReady = false;
    let phoneSaved = false;

    // Скрываем тест и результат
    testDiv.classList.add("hidden");
    resultDiv.classList.add("hidden");

    // Валидация и сохранение номера телефона
    savePhoneBtn.onclick = function() {
        let phone = phoneInput.value.trim();
        let phoneClean = phone.replace(/[^0-9+]/g, "");
        let valid = /^((\+7|8)[0-9]{10})$/.test(phoneClean);
        if (!valid) {
            alert("Введите корректный номер телефона РФ (например, +79991234567 или 89991234567)");
            phoneSaved = false;
            return;
        }
        // Сохраняем номер в localStorage
        let stored = localStorage.getItem('phoneNumbers');
        let numbers = stored ? JSON.parse(stored) : [];
        if (!numbers.includes(phoneClean)) {
            numbers.push(phoneClean);
            localStorage.setItem('phoneNumbers', JSON.stringify(numbers));
        }
        phoneInput.disabled = true;
        savePhoneBtn.disabled = true;
        phoneSaved = true;
        alert("Номер телефона сохранён!");
    };

    // 1. Только после сохранения номера можно начать тест
    startTestBtn.onclick = function() {
        if (!phoneSaved) {
            alert("Пожалуйста, введите и сохраните номер телефона перед началом теста.");
            return;
        }
        document.getElementById("selection-block").style.display = "none";
        testDiv.classList.remove("hidden");
        resultDiv.classList.add("hidden");
        scoreP.textContent = "";
        questionsDiv.innerHTML = "";
        testReady = false;

        // Запускаем тест
        const selectedClass = classSelect.value;
        currentTest = tests.find(
            t => t.class === selectedClass && t.subject === 'mathematics'
        );
        if (!currentTest) {
            questionsDiv.innerHTML = "<p>Тест не найден.</p>";
            return;
        }
        answers = Array(currentTest.questions.length).fill(null);
        questionsDiv.innerHTML = "";
        currentTest.questions.forEach((q, idx) => {
            let qDiv = document.createElement("div");
            // Для третьего и четвертого вопроса (индексы 2 и 3) — особый класс и разметка
            if (idx === 2 || idx === 3) {
                qDiv.className = `question q${idx+1}`;
                qDiv.innerHTML = `<p>${idx + 1}. ${q.question}</p>`;
                let optionsRow = document.createElement("div");
                optionsRow.className = "answer-options-row";
                q.options.forEach(opt => {
                    let label = document.createElement("label");
                    label.className = "answer-option";
                    label.innerHTML = `<input type="radio" name="q${idx}" value='${opt.replace(/'/g, "&#39;")}' />${opt}`;
                    optionsRow.appendChild(label);
                });
                qDiv.appendChild(optionsRow);
            } else {
                qDiv.className = "question";
                qDiv.innerHTML = `<p>${idx + 1}. ${q.question}</p>`;
                q.options.forEach(opt => {
                    qDiv.innerHTML += `<label class=\"answer-option\"><input type=\"radio\" name=\"q${idx}\" value='${opt.replace(/'/g, "&#39;")}' />${opt}</label>`;
                });
            }
            questionsDiv.appendChild(qDiv);
        });
        showResultBtn.style.display = "block";
        testReady = true;
    };

    // 3. После прохождения теста — показать результат
    showResultBtn.onclick = function() {
        answers = currentTest.questions.map((q, idx) => {
            let selected = document.querySelector(`input[name="q${idx}"]:checked`);
            return selected ? selected.value : null;
        });
        // Подсвечиваем ответы и показываем объяснения только сейчас
        currentTest.questions.forEach((q, idx) => {
            let qDiv = questionsDiv.children[idx];
            let options = qDiv.querySelectorAll(`input[name="q${idx}"]`);
            options.forEach(opt => {
                const label = opt.closest('label');
                label.style.backgroundColor = "";
                label.style.color = "";
            });
            let selected = qDiv.querySelector(`input[name="q${idx}"]:checked`);
            if (selected) {
                const label = selected.closest('label');
                if (selected.value === q.correctAnswer) {
                    label.style.backgroundColor = "#d4edda";
                    label.style.color = "#155724";
                } else {
                    label.style.backgroundColor = "#f8d7da";
                    label.style.color = "#721c24";
                    options.forEach(opt => {
                        if (opt.value === q.correctAnswer) {
                            const correctLabel = opt.closest('label');
                            correctLabel.style.backgroundColor = "#d4edda";
                            correctLabel.style.color = "#155724";
                        }
                    });
                }
            }
            // Показывать объяснение только если ответ неправильный и есть explanation
            if (selected && selected.value !== q.correctAnswer && q.explanation) {
                let explanationDiv = document.createElement("div");
                explanationDiv.className = "explanation-box";
                explanationDiv.innerHTML = `<b>Объяснение:</b> ` + q.explanation;
                qDiv.appendChild(explanationDiv);
            }
        });
        let correct = 0;
        currentTest.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correct++;
        });
        scoreP.textContent = `Правильных ответов: ${correct} из ${currentTest.questions.length}`;
        resultDiv.classList.remove("hidden");
        showResultBtn.style.display = "none";

        // Сохраняем результат теста в localStorage
        let phone = phoneInput.value.trim();
        let phoneClean = phone.replace(/[^0-9+]/g, "");
        let testResult = {
            phone: phoneClean,
            class: classSelect.value,
            subject: subjectSelect.value,
            answers: answers,
            correctAnswers: currentTest.questions.map(q => q.correctAnswer)
        };
        let storedResults = localStorage.getItem('testResults');
        let results = storedResults ? JSON.parse(storedResults) : [];
        results.push(testResult);
        localStorage.setItem('testResults', JSON.stringify(results));
    };
});
