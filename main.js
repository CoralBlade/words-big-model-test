class WordLearningApp {
    constructor() {
        this.words = [];
        this.currentWordIndex = 0;
        this.isEditing = true;

        // Get DOM elements
        this.wordListInput = document.getElementById('wordListInput');
        this.wordListButton = document.getElementById('wordListButton');
        this.meaningInput = document.getElementById('meaningInput');
        this.checkButton = document.getElementById('checkButton');
        this.currentWordElement = document.getElementById('currentWord');
        this.historyList = document.getElementById('historyList');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.wordListButton.addEventListener('click', () => this.toggleWordList());
        this.checkButton.addEventListener('click', () => this.checkMeaning());
        this.meaningInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkMeaning();
            }
        });
    }

    toggleWordList() {
        if (this.isEditing) {
            // Confirm mode
            const wordList = this.wordListInput.value.trim();
            if (!wordList) {
                alert('Please enter some words first!');
                return;
            }

            // Split by spaces and newlines, filter out empty strings
            this.words = wordList.split(/[\s\n]+/).filter(word => word.length > 0);
            
            if (this.words.length === 0) {
                alert('Please enter valid words!');
                return;
            }

            this.wordListInput.disabled = true;
            this.wordListButton.textContent = 'Edit';
            this.meaningInput.disabled = false;
            this.checkButton.disabled = false;
            this.isEditing = false;
            this.currentWordIndex = 0;
            this.displayCurrentWord();
        } else {
            // Edit mode
            this.wordListInput.disabled = false;
            this.wordListButton.textContent = 'Confirm';
            this.meaningInput.disabled = true;
            this.checkButton.disabled = true;
            this.isEditing = true;
            this.currentWordElement.textContent = '';
            this.words = [];
        }
    }

    displayCurrentWord() {
        if (this.currentWordIndex < this.words.length) {
            this.currentWordElement.textContent = this.words[this.currentWordIndex];
        } else {
            this.currentWordElement.textContent = 'All words completed!';
            this.meaningInput.disabled = true;
            this.checkButton.disabled = true;
        }
    }

    async checkMeaning() {
        const userMeaning = this.meaningInput.value.trim();
        if (!userMeaning) return;

        try {
            const response = await this.queryOpenAI(this.words[this.currentWordIndex], userMeaning);
            this.addToHistory(this.words[this.currentWordIndex], userMeaning, response);
            this.meaningInput.value = '';
            this.currentWordIndex++;
            this.displayCurrentWord();
        } catch (error) {
            console.error('Error checking meaning:', error);
            alert('Error checking meaning. Please try again.');
        }
    }

    async queryOpenAI(word, meaning) {
        // Replace with your OpenAI API endpoint and key
        const response = await fetch('YOUR_OPENAI_API_ENDPOINT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
            },
            body: JSON.stringify({
                prompt: `Is "${meaning}" the meaning of "${word}"? Answer with exactly one character: Y for yes, N for no, E for partially correct or additional common meanings exist.`,
                max_tokens: 1
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].text.trim();
    }

    addToHistory(word, meaning, result) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        switch (result) {
            case 'Y':
                historyItem.classList.add('correct');
                break;
            case 'N':
                historyItem.classList.add('incorrect');
                break;
            case 'E':
                historyItem.classList.add('partial');
                break;
        }

        historyItem.textContent = `${word}: ${meaning}`;
        this.historyList.insertBefore(historyItem, this.historyList.firstChild);
    }
}

// Initialize the app
new WordLearningApp();