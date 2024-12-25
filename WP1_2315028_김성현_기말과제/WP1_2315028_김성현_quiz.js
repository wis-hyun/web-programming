let timer;
let currentQuestionIndex = 0;
let score = 0;
let selectedCategory = "";
let selectedDifficulty = "";
let questions = []; 

// 시작 페이지 초기화
document.getElementById("start-btn").addEventListener("click", () => {
    const usernameInput = document.getElementById("username").value.trim();
    if (usernameInput === "") {
        alert("이름을 입력해주세요!");
        return;
    }
    localStorage.setItem("username", usernameInput);
    document.getElementById("start-page").classList.add("hidden");
    document.getElementById("quiz-page").classList.remove("hidden");
});

// 퀴즈 데이터 로드
function loadQuestions(category, difficulty) {
    fetch('http://localhost:8080/2315028_dataStructure.json')
        .then(response => response.json())
        .then(data => {
            questions = data[difficulty];
            startQuiz();
        })
        .catch(error => console.error("퀴즈를 가져오는데 오류가 발생하였습니다. 오류:", error));
}

// 카테고리 선택
document.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", (event) => {
        selectedCategory = event.target.dataset.category;
        document.getElementById("category-select").classList.add("hidden");
        document.getElementById("difficulty").classList.remove("hidden");
    });
});

// 난이도 선택
document.querySelectorAll(".difficulty-btn").forEach(button => {
    button.addEventListener("click", (event) => {
        selectedDifficulty = event.target.dataset.difficulty;
        loadQuestions(selectedCategory, selectedDifficulty);
        document.getElementById("difficulty").classList.add("hidden");
        document.getElementById("quiz").classList.remove("hidden");
        startTimer();
    });
});

// 타이머 시작
function startTimer() {
    let timeLeft = 60;
    timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById("timer").textContent = `시간: ${minutes}:${seconds.toString().padStart(2, "0")}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("시간이 다 되었습니다.");
            showEndPage();
        } else {
            timeLeft--;
        }
    }, 1000);
}

// 퀴즈 시작
function startQuiz() {
    displayQuestion(questions[currentQuestionIndex]);
    const nextButton = document.getElementById("next-btn");
    nextButton.onclick = nextQuestionHandler; 
}

// 다음 질문 처리
function nextQuestionHandler() {
    const selectedAnswer = document.querySelector("input[name='choice']:checked");
    if (!selectedAnswer) {
        alert("답을 선택하세요.");
        return;
    }
    if (selectedAnswer.value === questions[currentQuestionIndex].correctAnswer) {
        score += 10;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        clearInterval(timer);
        showEndPage();
    }
}

function displayQuestion(question) {
    const questionContainer = document.getElementById("question");
    const choicesContainer = document.getElementById("choices");
    questionContainer.textContent = question.text;
    choicesContainer.innerHTML = question.choices
        .map(choice => `<li><input type="radio" name="choice" value="${choice}"> ${choice}</li>`)
        .join("");
}

// 종료 페이지
function showEndPage() {
    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("end-page").classList.remove("hidden");
    document.getElementById("score").textContent = `점수: ${score}`;

    // 최고 점수 갱신
    const highestScore = parseInt(localStorage.getItem("highestScore") || "0", 10);
    if (score > highestScore) {
        localStorage.setItem("highestScore", score);
    }
}

// 재시작 버튼 클릭
document.getElementById("restart-btn").addEventListener("click", () => {
    currentQuestionIndex = 0;
    score = 0;
    clearInterval(timer);

    // 퀴즈 데이터를 다시 로드
    if (selectedCategory && selectedDifficulty) {
        loadQuestions(selectedCategory, selectedDifficulty);
        document.getElementById("end-page").classList.add("hidden");
        document.getElementById("quiz").classList.remove("hidden");
        startTimer();
    } else {
        // 카테고리와 난이도를 다시 선택하도록 시작 페이지로 이동
        selectedCategory = "";
        selectedDifficulty = "";
        document.getElementById("end-page").classList.add("hidden");
        document.getElementById("start-page").classList.remove("hidden");
    }
});

// 랭킹 보기 버튼 클릭 이벤트
document.getElementById("stats-btn").addEventListener("click", () => {
    const username = localStorage.getItem("username");
    const score = document.getElementById("score").textContent.split(": ")[1]; 
    loadRankings(username, parseInt(score)); 
});

// 랭킹을 불러오는 함수
function loadRankings(currentUsername, currentScore) {
    fetch('http://localhost:8080/2315028_users.json') 
        .then(response => response.json())
        .then(users => {
            const allUsers = [...users, { username: currentUsername, highestScore: currentScore }];
            allUsers.sort((a, b) => b.highestScore - a.highestScore); 

            // 랭킹 목록 갱신
            const rankingList = document.getElementById("ranking-list");
            rankingList.innerHTML = ""; 
            let rank = 1;
            allUsers.forEach((user, index) => {
                if (index > 0 && allUsers[index - 1].highestScore !== user.highestScore) {
                    rank = index + 1;
                }
                const listItem = document.createElement("li");
                listItem.textContent = `${rank}등: ${user.username} - ${user.highestScore}점`;
                if (user.username === currentUsername) {
                    listItem.style.fontWeight = "bold"; 
                }
                rankingList.appendChild(listItem);
            });

            // 현재 사용자 랭킹 표시
            const userRank = allUsers.findIndex(user => user.username === currentUsername) + 1;
            const statsContainer = document.getElementById("stats");
            statsContainer.insertAdjacentHTML(
                "afterbegin",
                `<p>현재 랭킹: ${userRank}등</p>`
            );
            statsContainer.classList.remove("hidden");
        })
        .catch(error => console.error("랭킹 데이터를 불러오는 데 실패했습니다:", error));
}

//사용자 기록 저장
function saveUserRecord(username, highestScore, quizHistory) {
    fetch("http://localhost:8080/saveUserRecord", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, highestScore, quizHistory }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("서버 응답 오류");
            }
            return response.text();
        })
        .then((message) => {
            console.log(message);
            alert("사용자 기록이 저장되었습니다!");
        })
        .catch((error) => {
            console.error("사용자 기록 저장 실패:", error);
            alert("사용자 기록 저장에 실패했습니다.");
        });
}

// 종료 버튼 클릭 이벤트 수정
document.getElementById("end-btn").addEventListener("click", () => {
    const username = localStorage.getItem("username") || "Unknown";
    const highestScore = parseInt(localStorage.getItem("highestScore") || "0", 10);
    const quizHistory = JSON.parse(localStorage.getItem("quizHistory") || "[]");

    saveUserRecord(username, highestScore, quizHistory);

    // 페이지 새로고침 또는 종료 처리
    location.reload();
    window.location.href = "index.html";
});
