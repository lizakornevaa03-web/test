alert(typeof tests);
document.addEventListener("DOMContentLoaded", function() {
    const classSelect = document.getElementById("class");
    const subjectSelect = document.getElementById("subject");
    const startTestBtn = document.getElementById("startTest");
    const testDiv = document.getElementById("test");
    const questionsDiv = document.getElementById("questions");
    const submitTestBtn = document.getElementById("submitTest");
    const resultDiv = document.getElementById("result");
    const scoreP = document.getElementById("score");
    const phoneInput = document.getElementById("phone");
    const submitPhoneBtn = document.getElementById("submitPhone");

    let currentTest = null;

    startTestBtn.addEventListener("click", function() {
        const selectedClass = classSelect.value;
        const selectedSubject = subjectSelect.value;
        currentTest = tests.find(
            t => t.class === selectedClass && t.subject === selectedSubject
        );
        if (!currentTest) {
            questionsDiv.innerHTML = "<p>Тест не найден.</p>";
            testDiv.classList.remove("hidden");
            return;
        }
        questionsDiv.innerHTML = "";
        currentTest.questions.forEach((q, idx) => {
            let qDiv = document.createElement("div");
            qDiv.className = "question";
            qDiv.innerHTML = `<p>${idx + 1}. ${q.question}</p>`;
            q.options.forEach(opt => {
                qDiv.innerHTML += `<label class="answer-option"><input type="radio" name="q${idx}" value="${opt}"> ${opt}</label>`;
            });
            questionsDiv.appendChild(qDiv);
        });
        document.getElementById("selection").classList.add("hidden");
        testDiv.classList.remove("hidden");
        resultDiv.classList.add("hidden");
    });

    submitTestBtn.addEventListener("click", function() {
        let correct = 0;
        currentTest.questions.forEach((q, idx) => {
            let selected = document.querySelector(`input[name="q${idx}"]:checked`);
            if (selected && selected.value === q.correctAnswer) correct++;
        });
        scoreP.textContent = `Правильных ответов: ${correct} из ${currentTest.questions.length}`;
        testDiv.classList.add("hidden");
        resultDiv.classList.remove("hidden");
    });

    submitPhoneBtn.addEventListener("click", function() {
        alert("Спасибо! Ваш номер: " + phoneInput.value);
        // Здесь можно добавить отправку данных на сервер
    });
});