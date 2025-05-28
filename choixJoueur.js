    //Variables de sélection
    let selectedPlayers = 0;
    let selectedHero = null;
    let opponents = [];
    
    // Éléments DOM
    const playerBtns = document.querySelectorAll('[data-players]'); // Correction: 'data-players' au lieu de 'data-players'
    const heroCards = document.querySelectorAll('.hero-card');
    const opponentsContainer = document.getElementById('opponents-container');
    const startBtn = document.getElementById('start-btn');
    
    // Héros disponibles
    const heroes = [
        { type: 'chevalier', name: 'Chevalier', image: '/assests/chevalier.png', desc: 'Force et endurance' },
        { type: 'ninja', name: 'Ninja', image: '/assests/ninja.png', desc: 'Vitesse et agilité' },
        { type: 'sorcier', name: 'Sorcier', image: '/assests/sorcier.png', desc: 'Magie et puissance' }
    ];

    // Objet pour stocker les paramètres du jeu
    const gameSettings = {
        playerCount: 0,
        playerHero: null,
        opponents: []
    };
    
    // Sélection du nombre de joueurs
    playerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playerBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPlayers = parseInt(btn.dataset.players);
            generateOpponents();
            checkStartConditions();
        });
    });
    
    // Sélection du héros
    heroCards.forEach(card => {
        card.addEventListener('click', () => {
            heroCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedHero = card.dataset.hero;
            generateOpponents();
            checkStartConditions();
        });
    });
    
    // Génération des adversaires
    function generateOpponents() {
        opponents = [];
        opponentsContainer.innerHTML = '';
        
        if (selectedPlayers < 2 || !selectedHero) return;
        
        const availableHeroes = [...heroes];
        // Retirer le héros sélectionné par le joueur
        const playerHeroIndex = availableHeroes.findIndex(h => h.type === selectedHero);
        if (playerHeroIndex > -1) {
            availableHeroes.splice(playerHeroIndex, 1);
        }
        
        const opponentCount = selectedPlayers - 1;
        
        // Dupliquer les héros disponibles si nécessaire pour 4 joueurs
        let heroesPool = [];
        while (heroesPool.length < opponentCount) {
            heroesPool = [...heroesPool, ...availableHeroes];
        }
        
        // Mélanger et sélectionner
        const shuffledHeroes = [...heroesPool].sort(() => 0.5 - Math.random());
        opponents = shuffledHeroes.slice(0, opponentCount);
        
        // Mettre à jour gameSettings
        gameSettings.playerCount = selectedPlayers;
        gameSettings.playerHero = heroes.find(h => h.type === selectedHero);
        gameSettings.opponents = opponents;
        
        // Afficher les adversaires
        opponentsContainer.innerHTML = '<h3>Tu affronteras:</h3>';
        const opponentsList = document.createElement('div');
        opponentsList.style.display = 'flex';
        opponentsList.style.justifyContent = 'center';
        opponentsList.style.flexWrap = 'wrap';
        opponentsList.style.gap = '1rem';
        opponentsList.style.marginTop = '1rem';
        
        opponents.forEach(opponent => {
            const opponentCard = document.createElement('div');
            opponentCard.className = `hero-card ${opponent.type}`;
            opponentCard.innerHTML = `
                <img src="${opponent.image}" height="100" width="100" class="hero-img" alt="${opponent.name}">
                <h3>${opponent.name}</h3>
                <p>${opponent.desc}</p>
            `;
            opponentsList.appendChild(opponentCard);
        });
        
        opponentsContainer.appendChild(opponentsList);
    }
    
    // Vérifier si on peut commencer
    function checkStartConditions() {
        startBtn.disabled = !(selectedPlayers > 1 && selectedHero);
    }
    
    // Démarrer le jeu
    startBtn.addEventListener('click', () => {
        if (selectedPlayers > 1 && selectedHero) {
            // Stocker les paramètres dans sessionStorage
            sessionStorage.setItem('gameSettings', JSON.stringify(gameSettings));
            
            // Rediriger vers la page de jeu
            window.location.href = 'jeu.html';
        }
    });
