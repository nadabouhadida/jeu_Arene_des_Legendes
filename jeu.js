// Configuration des héros
const HERO_TYPES = ['Chevalier', 'Ninja', 'Sorcier'];

const HERO_CONFIG = {
    'Chevalier': { 
        health: 120, 
        attack: 30, 
        defense: 20, 
        range: 1, 
        move: 1,
        image: 'D:/jeu_frontend/assests/chevalier.png'
    },
    'Ninja': { 
        health: 80, 
        attack: 25, 
        defense: 10, 
        range: 1, 
        move: 2,
        image: 'D:/jeu_frontend/assests/ninja.png'
    },
    'Sorcier': { 
        health: 70, 
        attack: 35, 
        defense: 5, 
        range: 3, 
        move: 1,
        image: 'D:/jeu_frontend/assests/sorcier.png'
    }
};

// Configuration des timings
const TIMING = {
    DICE_ANIMATION: 1000,
    SHOW_RESULT: 2000,
    BETWEEN_ROLLS: 2500,
    BEFORE_START: 3000
};

// Éléments du DOM
const dice = document.getElementById('dice');
const rollButton = document.getElementById('rollButton');
const resultDisplay = document.getElementById('result');
const arena = document.getElementById('arena');

// Animations du dé
const diceAnimations = [
    'rotateX(0deg) rotateY(0deg)',
    'rotateX(0deg) rotateY(-90deg)',
    'rotateX(0deg) rotateY(180deg)',
    'rotateX(0deg) rotateY(90deg)',
    'rotateX(-90deg) rotateY(0deg)',
    'rotateX(90deg) rotateY(0deg)'
];

// État du jeu
let gameState = {
    playerHero: null,
    enemies: [],
    arenaSize: 7,
    movingMode: false,
    attackingMode: false,
    specialAttackMode: false,
    selectedCell: null,
    turnOrder: [],
    currentTurnIndex: 0,
    currentAttackTarget: null,
    currentAttackCells: [],
    isDefending: false
};

let currentPlayerTurn = null;
let playerRoll = 0;
let enemyRolls = [];
let gamePhase = "rolling";

// ======================
// SYSTÈME DE CLASSES HÉROS
// ======================

class Hero {
    constructor(type, config, playerInfo) {
        this.type = type;
        this.name = playerInfo.name || type;
        this.health = config.health;
        this.attack = config.attack;
        this.defense = config.defense;
        this.range = config.range;
        this.move = config.move;
        this.image = config.image;
        this.x = playerInfo.x || 0;
        this.y = playerInfo.y || 0;
        this.currentHealth = config.health;
        this.player = playerInfo.player || 0;
        this.isDefending = false;
    }

    getMoveDirections() {
        return [
            {dx: 0, dy: -1}, // haut
            {dx: 1, dy: 0},  // droite
            {dx: 0, dy: 1},  // bas
            {dx: -1, dy: 0}  // gauche
        ];
    }

    defend() {
        this.isDefending = true;
        return true;
    }

    resetDefense() {
        this.isDefending = false;
    }
}

class Chevalier extends Hero {
    constructor(playerInfo) {
        super('Chevalier', HERO_CONFIG.Chevalier, playerInfo);
        this.specialAvailable = true;
        this.specialCooldown = 0;
    }

    getAttackableCells(arenaSize, enemies) {
        const attackableCells = [];
        const directions = [
            {dx: 0, dy: -1}, // haut
            {dx: 1, dy: 0},  // droite
            {dx: 0, dy: 1},  // bas
            {dx: -1, dy: 0}  // gauche
        ];
        
        // remplissage de tableau pour stocker les cases cibles 
        directions.forEach(dir => {
            const targetX = this.x + dir.dx;
            const targetY = this.y + dir.dy;
            
            if (targetX >= 0 && targetX < arenaSize && 
                targetY >= 0 && targetY < arenaSize) {
                attackableCells.push({x: targetX, y: targetY});
            }
        });

        return attackableCells;
    }
   // utilisation pouvoir spécial
    useSpecialAbility() {
        if (this.specialAvailable) {
            this.specialAvailable = false;
            this.specialCooldown = 3;
            return true;
        }
        return false;
    }
    // décrémentation pour le pouvoir spécial
    reduceCooldown() {
        if (this.specialCooldown > 0) {
            this.specialCooldown--;
            if (this.specialCooldown === 0) {
                this.specialAvailable = true;
            }
        }
    }
}

class Ninja extends Hero {
    constructor(playerInfo) {
        super('Ninja', HERO_CONFIG.Ninja, playerInfo);
        this.specialAvailable = true;
        this.specialCooldown = 0;
    }

    getAttackableCells(arenaSize, enemies) {
        const attackableCells = [];
        const directions = [
            {dx: 0, dy: -1}, // haut
            {dx: 1, dy: 0},  // droite
            {dx: 0, dy: 1},  // bas
            {dx: -1, dy: 0}  // gauche
        ];

        directions.forEach(dir => {
            const targetX = this.x + dir.dx;
            const targetY = this.y + dir.dy;
            
            if (targetX >= 0 && targetX < arenaSize && 
                targetY >= 0 && targetY < arenaSize) {
                attackableCells.push({x: targetX, y: targetY});
            }
        });

        return attackableCells;
    }

    useSpecialAbility() {
        if (this.specialAvailable) {
            this.specialAvailable = false;
            this.specialCooldown = 3;
            return true;
        }
        return false;
    }

    reduceCooldown() {
        if (this.specialCooldown > 0) {
            this.specialCooldown--;
            if (this.specialCooldown === 0) {
                this.specialAvailable = true;
            }
        }
    }
}

class Sorcier extends Hero {
    constructor(playerInfo) {
        super('Sorcier', HERO_CONFIG.Sorcier, playerInfo);
        this.specialAvailable = true;
        this.specialCooldown = 0;
    }

    getAttackableCells(arenaSize, enemies) {
        const attackableCells = [];
        const directions = [
            {dx: 0, dy: -1}, // haut
            {dx: 1, dy: 0},  // droite
            {dx: 0, dy: 1},  // bas
            {dx: -1, dy: 0}  // gauche
        ];

        directions.forEach(dir => {
            for (let distance = 2; distance <= 3; distance++) {
                const targetX = this.x + (dir.dx * distance);
                const targetY = this.y + (dir.dy * distance);
                
                if (targetX >= 0 && targetX < arenaSize && 
                    targetY >= 0 && targetY < arenaSize) {
                    
                    let lineOfSightBlocked = false;
                    for (let d = 1; d < distance; d++) {
                        const checkX = this.x + (dir.dx * d);
                        const checkY = this.y + (dir.dy * d);
                        if (enemies.some(e => e.x === checkX && e.y === checkY)) {
                            lineOfSightBlocked = true;
                            break;
                        }
                    }
                    
                    if (!lineOfSightBlocked) {
                        attackableCells.push({x: targetX, y: targetY});
                    }
                }
            }
        });

        return attackableCells;
    }

    useSpecialAbility() {
        if (this.specialAvailable) {
            this.specialAvailable = false;
            this.specialCooldown = 3;
            return true;
        }
        return false;
    }

    reduceCooldown() {
        if (this.specialCooldown > 0) {
            this.specialCooldown--;
            if (this.specialCooldown === 0) {
                this.specialAvailable = true;
            }
        }
    }

    getSpecialAttackRange() {
        const directions = [
            {dx: 0, dy: -1}, // haut
            {dx: 1, dy: 0},  // droite
            {dx: 0, dy: 1},  // bas
            {dx: -1, dy: 0}  // gauche
        ];

        const attackableCells = [];
        
        directions.forEach(dir => {
            for (let distance = 1; distance <= 3; distance++) {
                const targetX = this.x + (dir.dx * distance);
                const targetY = this.y + (dir.dy * distance);
                
                if (targetX >= 0 && targetX < gameState.arenaSize && 
                    targetY >= 0 && targetY < gameState.arenaSize) {
                    attackableCells.push({x: targetX, y: targetY});
                }
            }
        });

        return attackableCells;
    }
}

class HeroFactory {
    static createHero(type, playerInfo) {
        switch(type) {
            case 'Chevalier':
                return new Chevalier(playerInfo);
            case 'Ninja':
                return new Ninja(playerInfo);
            case 'Sorcier':
                return new Sorcier(playerInfo);
            default:
                throw new Error(`Type de héros inconnu: ${type}`);
        }
    }
}

// ======================
// FONCTIONS DU JEU
// ======================


function initGame() {
    createArena();
    
    // Récupérer les paramètres du jeu depuis sessionStorage
    const savedSettings = sessionStorage.getItem('gameSettings');
    if (!savedSettings) {
        // Rediriger vers la page de sélection si aucun paramètre n'est trouvé
        window.location.href = 'choixJoueur.html';
        return;
    }
    
    const gameSettings = JSON.parse(savedSettings);
    
    setTimeout(() => {
        // Créer le héros du joueur
        gameState.playerHero = HeroFactory.createHero(
            capitalizeFirstLetter(gameSettings.playerHero.type), // Convertit "chevalier" en "Chevalier"
            {
                name: 'Votre Héros',
                x: 0,
                y: 0,
                player: 0
            }
        );
        
        // Créer les ennemis
        gameState.enemies = gameSettings.opponents.map((opponent, index) => {
            //tableau contenant les coordonnées des coins de l'arène
            const corners = [
                {x: 0, y: gameState.arenaSize - 1},
                {x: gameState.arenaSize - 1, y: 0}, 
                {x: gameState.arenaSize - 1, y: gameState.arenaSize - 1}
            ];
            
            return HeroFactory.createHero(
                capitalizeFirstLetter(opponent.type),
                {
                    name: `${opponent.name} ${index+1}`,
                    x: corners[index].x,
                    y: corners[index].y,
                    player: index + 1
                }
            );
        });
        
        placeHeroes();
        updateEnemiesInfo();
        updateHeroProfile();
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
        
        document.getElementById('move-btn').addEventListener('click', enableMovementMode);
        document.getElementById('attack-btn').addEventListener('click', enableAttackMode);
        document.getElementById('special-btn').addEventListener('click', enableSpecialAttackMode);
        document.getElementById('defend-btn').addEventListener('click', enableDefenseMode);
        document.getElementById('end-turn-btn').addEventListener('click', endPlayerTurn);
        
        startDiceRollPhase();
    }, 50);
}

// Fonction utilitaire pour capitaliser la première lettre
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateHeroProfile() {
    const hero = gameState.playerHero;
    const heroProfile = document.querySelector('.hero-profile');
    
    heroProfile.innerHTML = `
        <img src="${hero.image}" alt="${hero.type}" class="profile-image">
        <div class="hero-name">${hero.type}</div>
        <div class="hero-stats">PV : ${hero.currentHealth}/${hero.health}</div>
        <div class="hero-stats">Attaque : ${hero.attack}</div>
        <div class="hero-stats">Défense : ${hero.defense}</div>
        <div class="hero-stats">Pouvoir : <span id="special-cooldown" class="${hero.specialAvailable ? 'ready' : 'cooldown'}">
            ${hero.specialAvailable ? 'Prêt' : `${hero.specialCooldown} tour(s)`}
        </span></div>
    `;
}

function placeHeroes() {
    document.querySelectorAll('.hero-container').forEach(el => el.remove());// netoyage de position (héro existant)
    
    placeHero(gameState.playerHero); //place hero
    gameState.enemies.forEach(enemy => placeHero(enemy));//placement des ennemies
    updateHeroProfile();
}

function placeHero(hero) {
    // Vérification que la cellule existe
    const cellSelector = `.cell[data-x="${hero.x}"][data-y="${hero.y}"]`;
    const cell = document.querySelector(cellSelector);
    
    if (!cell) {
        console.error(`Cellule non trouvée en [${hero.x},${hero.y}]`);
        return;
    }

    // Nettoyage uniquement du contenu héros existant
    const oldHero = cell.querySelector('.hero-container');
    if (oldHero) cell.removeChild(oldHero);

    // Création du container
    const container = document.createElement('div');
    container.className = 'hero-container';
    container.dataset.player = hero.player;

    // Image du héros (inchangée)
    const img = document.createElement('img');
    img.className = 'hero-image';
    img.src = hero.image;
    img.alt = hero.type;
    container.appendChild(img);

    // Barre de vie (nouveauté)
    if (hero.currentHealth > 0) {
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        
        const healthFill = document.createElement('div');
        healthFill.className = 'health-fill';
        healthFill.style.width = `${(hero.currentHealth / hero.health) * 100}%`;
        
        // Couleur dynamique
        if (hero.currentHealth > hero.health * 0.6) {
            healthFill.style.backgroundColor = '#00FF1A';
        } else if (hero.currentHealth > hero.health * 0.3) {
            healthFill.style.backgroundColor = '#FFC107';
        } else {
            healthFill.style.backgroundColor = '#F44336';
        }
        
        healthBar.appendChild(healthFill);
        container.appendChild(healthBar);
    }

    // Ajout à la cellule
    cell.appendChild(container);
}

// ======================
// FONCTIONS DE DÉPLACEMENT
// ======================

function enableMovementMode() {
    if (gamePhase !== "playing" || currentPlayerTurn !== 0) return;
    
    gameState.movingMode = true;
    gameState.attackingMode = false;
    gameState.specialAttackMode = false;
    gameState.isDefending = false;
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('attackable', 'enemy-target', 'movable');
    });
    highlightMovableCells();
    resultDisplay.textContent = "Sélectionnez une case pour vous déplacer";
}

function highlightMovableCells() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('movable');
    });

    const hero = gameState.playerHero;
    const directions = hero.getMoveDirections();

    if (hero.type === 'Ninja') {
        directions.forEach(dir => {
            let newX = hero.x + dir.dx;
            let newY = hero.y + dir.dy;
            
            if (isValidCell(newX, newY) && !isCellOccupied(newX, newY)) {
                document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`).classList.add('movable');
                
                newX += dir.dx;
                newY += dir.dy;
                
                if (isValidCell(newX, newY) && !isCellOccupied(newX, newY)) {
                    document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`).classList.add('movable');
                }
            }
        });
    } else {
        directions.forEach(dir => {
            const newX = hero.x + dir.dx;
            const newY = hero.y + dir.dy;
            
            if (isValidCell(newX, newY) && !isCellOccupied(newX, newY)) {
                document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`).classList.add('movable');
            }
        });
    }
}

function moveHeroTo(x, y) {
    const hero = gameState.playerHero;
    
    const oldCell = document.querySelector(`.cell[data-x="${hero.x}"][data-y="${hero.y}"]`);
    if (oldCell) oldCell.innerHTML = '';
    
    hero.x = x;
    hero.y = y;
    
    placeHero(hero);
    updateHeroProfile();
    
    gameState.movingMode = false;
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('movable');
    });
    
    resultDisplay.textContent = "Déplacement effectué";
}

// ======================
// FONCTIONS D'ATTAQUE
// ======================

function enableAttackMode() {
    if (gamePhase !== "playing" || currentPlayerTurn !== 0) return;
    
    gameState.attackingMode = true;
    gameState.movingMode = false;
    gameState.specialAttackMode = false;
    gameState.isDefending = false;
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('movable', 'attackable', 'enemy-target');
    });
    
    if (gameState.playerHero.type === 'Sorcier') {
        highlightAttackableCells();
        resultDisplay.textContent = "Sélectionnez une case pour attaquer";
    } else if (gameState.playerHero.type === 'Ninja') {
        // Pour le Ninja, montrer à la fois les cases de déplacement et d'attaque
        highlightNinjaAttackOptions();
        resultDisplay.textContent = "Sélectionnez une case pour attaquer (rouge) ou vous déplacer (vert)";
    } else if (gameState.playerHero.type === 'Chevalier') {
        highlightChevalierAttackableCells();
        resultDisplay.textContent = "Sélectionnez une case adjacente pour attaquer";
    }
}
function highlightNinjaAttackOptions() {
    const ninja = gameState.playerHero;
    
    // 1. D'abord marquer toutes les cases attaquables (en rouge/jaune)
    const attackableCells = ninja.getAttackableCells(gameState.arenaSize, gameState.enemies);
    
    attackableCells.forEach(cellPos => {
        const cell = document.querySelector(`.cell[data-x="${cellPos.x}"][data-y="${cellPos.y}"]`);
        if (cell) {
            cell.classList.add('attackable');
            
            // Marquer les cases avec ennemis en jaune
            const enemyHere = gameState.enemies.find(e => e.x === cellPos.x && e.y === cellPos.y);
            if (enemyHere) {
                cell.classList.add('enemy-target');
            }
        }
    });
    
    // 2. Ensuite marquer les cases de déplacement (en vert)
    const directions = ninja.getMoveDirections();
    
    directions.forEach(dir => {
        // Premier pas de déplacement
        let newX = ninja.x + dir.dx;
        let newY = ninja.y + dir.dy;
        
        if (isValidCell(newX, newY) && !isCellOccupied(newX, newY)) {
            const cell = document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`);
            
            // Ne pas écraser les cases d'attaque existantes
            if (cell && !cell.classList.contains('attackable')) {
                cell.classList.add('movable');
            }
            
            // Deuxième pas de déplacement (spécifique au Ninja)
            newX += dir.dx;
            newY += dir.dy;
            
            if (isValidCell(newX, newY) && !isCellOccupied(newX, newY)) {
                const cell = document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`);
                if (cell && !cell.classList.contains('attackable')) {
                    cell.classList.add('movable');
                }
            }
        }
    });
    
    // attaque directement 
    const adjacentEnemies = gameState.enemies.filter(enemy => {
        return Math.abs(enemy.x - ninja.x) + Math.abs(enemy.y - ninja.y) === 1;
    });
    
    if (adjacentEnemies.length > 0) {
        resultDisplay.textContent = "Choisissez : Attaquer (rouge/jaune) ou vous déplacer (vert)";
    } else {
        resultDisplay.textContent = "Déplacez-vous (vert) pour atteindre un ennemi";
    }
}
function highlightAttackableCells() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('attackable', 'enemy-target');
    });

    const sorcier = gameState.playerHero;
    const attackableCells = sorcier.getAttackableCells(gameState.arenaSize, gameState.enemies);

    attackableCells.forEach(cellPos => {
        const cell = document.querySelector(`.cell[data-x="${cellPos.x}"][data-y="${cellPos.y}"]`);
        if (cell) {
            cell.classList.add('attackable');
            
            const enemyHere = gameState.enemies.find(e => e.x === cellPos.x && e.y === cellPos.y);
            if (enemyHere) {
                cell.classList.add('enemy-target');
            }
        }
    });
}


function highlightChevalierAttackableCells() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('attackable', 'enemy-target');
    });

    const chevalier = gameState.playerHero;
    const attackableCells = chevalier.getAttackableCells(gameState.arenaSize, gameState.enemies);

    attackableCells.forEach(cellPos => {
        const cell = document.querySelector(`.cell[data-x="${cellPos.x}"][data-y="${cellPos.y}"]`);
        if (cell) {
            cell.classList.add('attackable');
            
            const enemyHere = gameState.enemies.find(e => e.x === cellPos.x && e.y === cellPos.y);
            if (enemyHere) {
                cell.classList.add('enemy-target');
            }
        }
    });
}
//------------pouvoir spécial------------------
function enableSpecialAttackMode() {
    if (gamePhase !== "playing" || currentPlayerTurn !== 0) return;
    
    if (gameState.playerHero.type === 'Sorcier') {
        if (!gameState.playerHero.specialAvailable) return;
        
        gameState.specialAttackMode = true;
        gameState.movingMode = false;
        gameState.attackingMode = false;
        gameState.isDefending = false;
        
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('movable', 'attackable', 'enemy-target');
        });
        
        highlightSpecialAttackCells();
        resultDisplay.textContent = "Sélectionnez une zone pour la Tempête Magique";
    } else if (gameState.playerHero.type === 'Ninja') {
        if (!gameState.playerHero.specialAvailable) return;
        
        gameState.specialAttackMode = true;
        gameState.movingMode = false;
        gameState.attackingMode = false;
        gameState.isDefending = false;
        
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('movable', 'attackable', 'enemy-target');
        });
        
        highlightNinjaAttackableCells();
        resultDisplay.textContent = "Sélectionnez une cible pour l'attaque spéciale (Double Attaque)";
    } else if (gameState.playerHero.type === 'Chevalier') {
        if (!gameState.playerHero.specialAvailable) return;
        
        gameState.specialAttackMode = true;
        gameState.movingMode = false;
        gameState.attackingMode = false;
        gameState.isDefending = false;
        
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('movable', 'attackable', 'enemy-target');
        });
        
        highlightChevalierAttackableCells();
        resultDisplay.textContent = "Sélectionnez une cible pour l'attaque spéciale (Cri de Guerre)";
    }
}
//pouvoir spécial ninja 
function highlightNinjaAttackableCells() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('attackable', 'enemy-target');
    });

    const ninja = gameState.playerHero;
    const attackableCells = ninja.getAttackableCells(gameState.arenaSize, gameState.enemies);

    attackableCells.forEach(cellPos => {
        const cell = document.querySelector(`.cell[data-x="${cellPos.x}"][data-y="${cellPos.y}"]`);
        if (cell) {
            cell.classList.add('attackable');
            
            const enemyHere = gameState.enemies.find(e => e.x === cellPos.x && e.y === cellPos.y);
            if (enemyHere) {
                cell.classList.add('enemy-target');
            }
        }
    });
}

function highlightSpecialAttackCells() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('attackable', 'enemy-target');
    });

    if (gameState.playerHero.type === 'Sorcier') {
        const attackableCells = gameState.playerHero.getSpecialAttackRange();
        attackableCells.forEach(cellPos => {
            const cell = document.querySelector(`.cell[data-x="${cellPos.x}"][data-y="${cellPos.y}"]`);
            if (cell) {
                cell.classList.add('attackable');
                
                const enemyHere = gameState.enemies.find(e => e.x === cellPos.x && e.y === cellPos.y);
                if (enemyHere) {
                    cell.classList.add('enemy-target');
                }
            }
        });
    }
}

//------------défense-------------

function enableDefenseMode() {
    if (gamePhase !== "playing" || currentPlayerTurn !== 0) return;
    
    gameState.movingMode = false;
    gameState.attackingMode = false;
    gameState.specialAttackMode = false;
    gameState.isDefending = true;
    
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('movable', 'attackable', 'enemy-target');
    });
    
    gameState.playerHero.defend();
    updateHeroProfile();
    resultDisplay.textContent = "Vous vous préparez à vous défendre. Les dégâts reçus au prochain tour seront réduits.";
    
    document.getElementById('move-btn').disabled = true;
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('special-btn').disabled = true;
    document.getElementById('defend-btn').disabled = true;
    document.getElementById('end-turn-btn').disabled = false;
}


function initiateSpecialAttack() {
    gameState.specialAttackMode = false;
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('attackable', 'enemy-target');
    });
    
    if (gameState.playerHero.type === 'Sorcier') {
        resultDisplay.textContent = "Lancez le dé pour la Tempête Magique !";
        document.getElementById('rollButton').disabled = false;
        document.getElementById('attack-btn').disabled = false;
        document.getElementById('special-btn').disabled = true;
        document.getElementById('defend-btn').disabled = true;
        document.getElementById('end-turn-btn').disabled = true;
        
        gameState.currentAttackTarget = null;
        gameState.currentAttackCells = gameState.playerHero.getSpecialAttackRange();
        gameState.playerHero.useSpecialAbility();
        updateHeroProfile();
    } else if (gameState.playerHero.type === 'Chevalier') {
        const enemy = gameState.enemies.find(e => e.x === gameState.selectedCell.x && e.y === gameState.selectedCell.y);
        if (enemy) {
            resultDisplay.textContent = "Lancez le dé pour l'attaque spéciale (Cri de Guerre) !";
            document.getElementById('rollButton').disabled = false;
            document.getElementById('attack-btn').disabled = true;
            document.getElementById('special-btn').disabled = true;
            document.getElementById('defend-btn').disabled = true;
            document.getElementById('end-turn-btn').disabled = true;
            
            gameState.currentAttackTarget = enemy;
            gameState.currentAttackCells = null;
            gameState.playerHero.useSpecialAbility();
            updateHeroProfile();
        }
    }
}

function resolveAttack(rollValue) {
    if (gameState.currentAttackCells) {
        resolveSpecialAttack(rollValue);
    } else {
        resolveNormalAttack(rollValue);
    }
}

//lancer le dé d'attaque
function initiateAttack(enemy) {
    gameState.attackingMode = false;
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('attackable', 'enemy-target');
    });
    
    resultDisplay.textContent = "Lancez le dé pour attaquer !";
    document.getElementById('rollButton').disabled = false;
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('special-btn').disabled = !gameState.playerHero.specialAvailable;
    document.getElementById('defend-btn').disabled = true;
    document.getElementById('end-turn-btn').disabled = true;
    
    gameState.currentAttackTarget = enemy;
    gameState.currentAttackCells = null;
    
    if (gameState.specialAttackMode) {
        if (gameState.playerHero.type === 'Ninja') {
            gameState.playerHero.useSpecialAbility();
        } else if (gameState.playerHero.type === 'Chevalier') {
            gameState.playerHero.useSpecialAbility();
        }
        updateHeroProfile();
    }
}

function resolveNormalAttack(rollValue) {
    const target = gameState.currentAttackTarget;
    let damage = 0;
    let message = "";
    let isCritical = false;
    
    if (rollValue <= 2) {
        message = `Attaque échouée (${rollValue}) !`;
    } 
    else if (rollValue <= 5) {
        damage = Math.max(1, gameState.playerHero.attack - target.defense);
        if (target.isDefending) {
            damage = Math.floor(damage * 0.5);
            target.resetDefense();
        }
        
        // Bonus pour le Cri de Guerre du Chevalier
        if (gameState.specialAttackMode && gameState.playerHero.type === 'Chevalier') {
            damage = Math.floor(damage * 1.5); // +50% de dégâts
            message = `Cri de Guerre réussi (${rollValue}) ! ${damage} dégâts infligés.`;
        } 
        // Double attaque si c'est le pouvoir spécial du ninja
        else if (gameState.specialAttackMode && gameState.playerHero.type === 'Ninja') {
            damage *= 2;
            message = `Double attaque réussie (${rollValue}) ! ${damage} dégâts infligés.`;
        } else {
            message = `Attaque réussie (${rollValue}) ! ${damage} dégâts infligés.`;
        }
    } 
    else {
        isCritical = true;
        damage = Math.max(1, (gameState.playerHero.attack * 2) - target.defense);
        if (target.isDefending) {
            damage = Math.floor(damage * 0.5);
            target.resetDefense();
        }
        
        // Bonus pour le Cri de Guerre du Chevalier
        if (gameState.specialAttackMode && gameState.playerHero.type === 'Chevalier') {
            damage = Math.floor(damage * 1.5); // +50% de dégâts
            message = `Cri de Guerre critique (${rollValue}) ! ${damage} dégâts infligés.`;
        } 
        // Double attaque si c'est le pouvoir spécial du ninja
        else if (gameState.specialAttackMode && gameState.playerHero.type === 'Ninja') {
            damage *= 2;
            message = `Double attaque critique (${rollValue}) ! ${damage} dégâts infligés.`;
        } else {
            message = `Coup critique (${rollValue}) ! ${damage} dégâts infligés.`;
        }
    }
    
    target.currentHealth -= damage;
    resultDisplay.textContent = message;
    updateEnemiesInfo();
    placeHeroes();
    updateHeroProfile();
    
    if (target.currentHealth <= 0) {
        gameState.enemies = gameState.enemies.filter(e => e !== target);
        resultDisplay.textContent += ` ${target.name} a été vaincu !`;
        updateEnemiesInfo();
        placeHeroes();
        
        // Vérifier si tous les ennemis sont vaincus
        if (gameState.enemies.length === 0) {
            endGame(true);
            return;
        }
    }
    
    document.getElementById('attack-btn').disabled = false;
    document.getElementById('special-btn').disabled = !gameState.playerHero.specialAvailable;
    document.getElementById('defend-btn').disabled = false;
    document.getElementById('end-turn-btn').disabled = false;
    gameState.currentAttackTarget = null;
    gameState.specialAttackMode = false;
}

function resolveSpecialAttack(rollValue) {
    if (gameState.playerHero.type === 'Sorcier') {
        const sorcier = gameState.playerHero;
        let totalDamage = 0;
        let enemiesHit = [];
        const attackCells = gameState.currentAttackCells;
        
        attackCells.forEach(cellPos => {
            const enemy = gameState.enemies.find(e => e.x === cellPos.x && e.y === cellPos.y);
            if (enemy) {
                let damage = 0;
                
                if (rollValue <= 2) {
                    damage = 0;
                } else if (rollValue <= 5) {
                    damage = Math.max(1, sorcier.attack - enemy.defense);
                    if (enemy.isDefending) {
                        damage = Math.floor(damage * 0.5);
                        enemy.resetDefense();
                    }
                } else {
                    damage = Math.max(1, (sorcier.attack * 1.5) - enemy.defense);
                    if (enemy.isDefending) {
                        damage = Math.floor(damage * 0.5);
                        enemy.resetDefense();
                    }
                }
                
                enemy.currentHealth -= damage;
                totalDamage += damage;
                enemiesHit.push(enemy.name);
            }
        });

        let message = "Tempête Magique ! ";
        if (enemiesHit.length > 0) {
            message += `${totalDamage} dégâts totaux infligés à ${enemiesHit.join(', ')}.`;
        } else {
            message += "Aucun ennemi touché.";
        }
        
        resultDisplay.textContent = message;
        updateEnemiesInfo();
        placeHeroes();
        updateHeroProfile();

        gameState.enemies = gameState.enemies.filter(e => e.currentHealth > 0);
        gameState.currentAttackCells = null;
        
        // Vérifier si tous les ennemis sont vaincus
        if (gameState.enemies.length === 0) {
            endGame(true);
            return;
        }
    }
    
    document.getElementById('attack-btn').disabled = false;
    document.getElementById('special-btn').disabled = !gameState.playerHero.specialAvailable;
    document.getElementById('defend-btn').disabled = false;
    document.getElementById('end-turn-btn').disabled = false;
}

// ======================
// FONCTIONS UTILITAIRES
// ======================

function isValidCell(x, y) {
    return x >= 0 && x < gameState.arenaSize && y >= 0 && y < gameState.arenaSize;
}

function isCellOccupied(x, y) {
    if (gameState.playerHero.x === x && gameState.playerHero.y === y) return true;
    return gameState.enemies.some(enemy => enemy.x === x && enemy.y === y);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createArena() {
    arena.innerHTML = '';
    arena.style.gridTemplateColumns = `repeat(${gameState.arenaSize}, 1fr)`;
    
    for (let y = 0; y < gameState.arenaSize; y++) {
        for (let x = 0; x < gameState.arenaSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            arena.appendChild(cell);
        }
    }
}

function updateEnemiesInfo() {
    const enemiesContainer = document.getElementById('enemies-info');
    enemiesContainer.innerHTML = '<h3>Adversaires</h3>';
    
    gameState.enemies.forEach(enemy => {
        const enemyInfo = document.createElement('div');
        enemyInfo.className = 'info-box';
        
        const enemyImage = document.createElement('img');
        enemyImage.className = 'hero-mini-image';
        enemyImage.src = enemy.image;
        enemyImage.alt = enemy.type;
        
        const enemyText = document.createElement('div');
        enemyText.textContent = `${enemy.type}: ${enemy.currentHealth}/${enemy.health}PV`;
        
        enemyInfo.appendChild(enemyImage);
        enemyInfo.appendChild(enemyText);
        enemiesContainer.appendChild(enemyInfo);
    });
}

function handleCellClick(event) {
    const cell = event.currentTarget;
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    gameState.selectedCell = { x, y };

    // Mode déplacement normal
    if (gameState.movingMode && cell.classList.contains('movable')) {
        moveHeroTo(x, y);
        document.getElementById('end-turn-btn').disabled = false;
    }
    // Mode attaque normale
    else if (gameState.attackingMode && cell.classList.contains('attackable')) {
        const enemy = gameState.enemies.find(e => e.x === x && e.y === y);
        if (enemy) {
            initiateAttack(enemy);
        } else {
            resultDisplay.textContent = "Aucun ennemi sur cette case";
        }
    }
    // Cas spécial du Ninja : déplacement puis attaque
    else if (gameState.attackingMode && 
             gameState.playerHero.type === 'Ninja' && 
             cell.classList.contains('movable')) {
        
        // Sauvegarder l'état d'attaque avant le déplacement
        const wasInAttackMode = gameState.attackingMode;
        
        // Effectuer le déplacement
        moveHeroTo(x, y);
        
        // Réactiver le mode attaque après déplacement si on était en mode attaque
        if (wasInAttackMode) {
            setTimeout(() => {
                gameState.attackingMode = true;
                document.querySelectorAll('.cell').forEach(c => {
                    c.classList.remove('movable', 'attackable', 'enemy-target');
                });
                
                // Afficher seulement les cases d'attaque après déplacement
                const attackableCells = gameState.playerHero.getAttackableCells(gameState.arenaSize, gameState.enemies);
                
                attackableCells.forEach(cellPos => {
                    const cell = document.querySelector(`.cell[data-x="${cellPos.x}"][data-y="${cellPos.y}"]`);
                    if (cell) {
                        cell.classList.add('attackable');
                        
                        const enemyHere = gameState.enemies.find(e => e.x === cellPos.x && e.y === cellPos.y);
                        if (enemyHere) {
                            cell.classList.add('enemy-target');
                        }
                    }
                });
                
                resultDisplay.textContent = "Sélectionnez une cible pour attaquer après votre déplacement";
            }, 100);
        }
    }
    // Mode attaque spéciale
    else if (gameState.specialAttackMode && cell.classList.contains('attackable')) {
        if (gameState.playerHero.type === 'Sorcier') {
            initiateSpecialAttack();
        } else if (gameState.playerHero.type === 'Ninja') {
            const enemy = gameState.enemies.find(e => e.x === x && e.y === y);
            if (enemy) {
                initiateAttack(enemy);
            } else {
                resultDisplay.textContent = "Aucun ennemi sur cette case";
            }
        } else if (gameState.playerHero.type === 'Chevalier') {
            const enemy = gameState.enemies.find(e => e.x === x && e.y === y);
            if (enemy) {
                initiateSpecialAttack();
            } else {
                resultDisplay.textContent = "Aucun ennemi sur cette case";
            }
        }
    }
    // Cas où on clique sur une case non valide
    else if (gameState.attackingMode || gameState.movingMode || gameState.specialAttackMode) {
        resultDisplay.textContent = "Action impossible sur cette case";
    }
}
// ======================
// SYSTÈME DE TOUR
// ======================

function startDiceRollPhase() {
    gamePhase = "rolling";
    playerRoll = 0;
    enemyRolls = [];
    currentPlayerTurn = null;
    
    rollButton.disabled = false;
    document.getElementById('move-btn').disabled = true;
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('special-btn').disabled = true;
    document.getElementById('defend-btn').disabled = true;
    document.getElementById('end-turn-btn').disabled = true;
    resultDisplay.textContent = "Lancez le dé pour commencer !";
    
    dice.style.transform = '';
    dice.classList.remove('final-dice');
}

rollButton.addEventListener('click', () => {
    if (gamePhase === "rolling") {
        rollButton.disabled = true;
        resultDisplay.textContent = "Lancement en cours...";
        
        const randomRotation = Math.floor(Math.random() * 360) + 720;
        dice.style.transform = `rotateX(${randomRotation}deg) rotateY(${randomRotation}deg)`;
        
        setTimeout(() => {
            const randomFace = Math.floor(Math.random() * 6) + 1;
            dice.style.transform = diceAnimations[randomFace - 1];
            
            setTimeout(() => {
                playerRoll = randomFace;
                resultDisplay.textContent = `Vous avez fait ${randomFace}`;
                
                setTimeout(rollForEnemies, TIMING.BETWEEN_ROLLS);
            }, TIMING.SHOW_RESULT);
        }, TIMING.DICE_ANIMATION);
    } 
    else if (gameState.currentAttackTarget || gameState.currentAttackCells) {
        rollButton.disabled = true;
        resultDisplay.textContent = "Lancement du dé d'attaque...";
        
        const randomRotation = Math.floor(Math.random() * 360) + 720;
        dice.style.transform = `rotateX(${randomRotation}deg) rotateY(${randomRotation}deg)`;
        
        setTimeout(() => {
            const attackRoll = Math.floor(Math.random() * 6) + 1;
            dice.style.transform = diceAnimations[attackRoll - 1];
            
            setTimeout(() => {
                resolveAttack(attackRoll);
            }, TIMING.SHOW_RESULT);
        }, TIMING.DICE_ANIMATION);
    }
});

function rollForEnemies() {
    if (gameState.enemies.length === 0) {
        setTimeout(determineFirstPlayer, TIMING.BETWEEN_ROLLS);
        return;
    }
    
    const currentEnemyIndex = enemyRolls.length;
    const enemy = gameState.enemies[currentEnemyIndex];
    
    resultDisplay.textContent = `${enemy.name} lance le dé...`;
    
    const randomRotation = Math.floor(Math.random() * 360) + 720;
    dice.style.transform = `rotateX(${randomRotation}deg) rotateY(${randomRotation}deg)`;
    
    setTimeout(() => {
        const randomFace = Math.floor(Math.random() * 6) + 1;
        dice.style.transform = diceAnimations[randomFace - 1];
        
        setTimeout(() => {
            enemyRolls.push({
                player: enemy.player,
                value: randomFace,
                name: enemy.name
            });
            
            resultDisplay.textContent = `${enemy.name} a fait ${randomFace}`;
            
            if (enemyRolls.length < gameState.enemies.length) {
                setTimeout(rollForEnemies, TIMING.BETWEEN_ROLLS);
            } else {
                setTimeout(determineFirstPlayer, TIMING.BETWEEN_ROLLS);
            }
        }, TIMING.SHOW_RESULT);
    }, TIMING.DICE_ANIMATION);
}

function determineFirstPlayer() {
    const allRolls = [
        { player: 0, value: playerRoll, name: "Vous" },
        ...enemyRolls
    ];
    
    allRolls.sort((a, b) => b.value - a.value);
    
    dice.classList.add('final-dice');
    dice.style.transform = 'rotateX(15deg) rotateY(15deg) scale(0.8)';
    
    let resultsText = "";
    allRolls.forEach((roll, index) => {
        resultsText += `${index + 1}. ${roll.name}: ${roll.value}<br>`;
    });
    resultDisplay.innerHTML = resultsText;
    
    const firstPlayer = allRolls[0].player;
    
    setTimeout(() => {
        const allPlayers = [0, ...gameState.enemies.map(e => e.player)];
        const firstPlayerIndex = allPlayers.indexOf(firstPlayer);
        
        const antiClockOrder = [
            allPlayers[firstPlayerIndex],
            ...allPlayers.slice(0, firstPlayerIndex).reverse(),
            ...allPlayers.slice(firstPlayerIndex + 1).reverse()
        ];
        
        gameState.turnOrder = antiClockOrder;
        gameState.currentTurnIndex = 0;
        
        currentPlayerTurn = firstPlayer;
        gamePhase = "playing";
        startPlayerTurn(firstPlayer);
    }, TIMING.BEFORE_START);
}

function startPlayerTurn(playerId) {
    dice.classList.remove('final-dice');
    dice.style.transform = '';
    
    // Réinitialiser la défense pour le héros actif
    if (playerId === 0) {
        gameState.playerHero.resetDefense();
    } else {
        const enemy = gameState.enemies.find(e => e.player === playerId);
        if (enemy) enemy.resetDefense();
    }
    
    if (playerId === 0) {
        // Tour du joueur
        resultDisplay.textContent = "À votre tour ! Choisissez votre action";
        document.getElementById('move-btn').disabled = false;
        document.getElementById('attack-btn').disabled = false;
        document.getElementById('defend-btn').disabled = false;
        document.getElementById('end-turn-btn').disabled = false;
        
        const specialBtn = document.getElementById('special-btn');
        specialBtn.disabled = !gameState.playerHero.specialAvailable;
        
        // Réduire le cooldown du pouvoir spécial si nécessaire
        gameState.playerHero.reduceCooldown();
        updateHeroProfile();
    } else {
        // Tour de l'ennemi
        const enemy = gameState.enemies.find(e => e.player === playerId);
        if (!enemy) {
            nextTurn();
            return;
        }
        
        resultDisplay.textContent = `Tour de ${enemy.name}`;
        
        // Désactiver tous les boutons pendant le tour de l'ennemi
        document.getElementById('move-btn').disabled = true;
        document.getElementById('attack-btn').disabled = true;
        document.getElementById('special-btn').disabled = true;
        document.getElementById('defend-btn').disabled = true;
        document.getElementById('end-turn-btn').disabled = true;
        
        // L'ennemi choisit une action aléatoire
        setTimeout(() => {
            enemyTakeAction(enemy);
        }, 1500);
    }
}

function enemyTakeAction(enemy) {
    const availableActions = ['move', 'attack', 'defend'];
    
    // Ajouter l'action spéciale si disponible
    if (enemy.specialAvailable && Math.random() > 0.5) { // 50% de chance d'utiliser le pouvoir spécial si disponible
        availableActions.push('special');
    }
    
    // Choisir une action aléatoire
    const action = availableActions[Math.floor(Math.random() * availableActions.length)];
    
    switch(action) {
        case 'move':
            enemyMove(enemy);
            break;
        case 'attack':
            enemyAttack(enemy);
            break;
        case 'defend':
            enemyDefend(enemy);
            break;
        case 'special':
            enemySpecialAttack(enemy);
            break;
    }
}

function enemyMove(enemy) {
    const directions = enemy.getMoveDirections();
    const possibleMoves = [];
    
    directions.forEach(dir => {
        let newX, newY;
        
        if (enemy.type === 'Ninja') {
            // Le ninja peut se déplacer de 2 cases
            for (let distance = 1; distance <= 2; distance++) {
                newX = enemy.x + (dir.dx * distance);
                newY = enemy.y + (dir.dy * distance);
                
                if (isValidCell(newX, newY) && !isCellOccupied(newX, newY)) {
                    possibleMoves.push({x: newX, y: newY, distance});
                } else {
                    break; // Si la case est occupée ou invalide, on ne peut pas aller plus loin
                }
            }
        } else {
            // Autres héros se déplacent d'une case
            newX = enemy.x + dir.dx;
            newY = enemy.y + dir.dy;
            
            if (isValidCell(newX, newY) && !isCellOccupied(newX, newY)) {
                possibleMoves.push({x: newX, y: newY, distance: 1});
            }
        }
    });
    
    if (possibleMoves.length > 0) {
        // Choisir un déplacement aléatoire
        const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        
        // Effectuer le déplacement
        const oldCell = document.querySelector(`.cell[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
        if (oldCell) oldCell.innerHTML = '';
        
        enemy.x = move.x;
        enemy.y = move.y;
        
        placeHero(enemy);
        resultDisplay.textContent = `${enemy.name} s'est déplacé`;
    } else {
        resultDisplay.textContent = `${enemy.name} ne peut pas se déplacer`;
    }
    
    // Passer au tour suivant après un court délai
    setTimeout(() => {
        nextTurn();
    }, 1500);
}

function enemyAttack(enemy) {
    // Trouver les cibles possibles
    let attackableCells = [];
    
    if (enemy.type === 'Sorcier') {
        attackableCells = enemy.getAttackableCells(gameState.arenaSize, [gameState.playerHero]);
    } else {
        attackableCells = enemy.getAttackableCells(gameState.arenaSize, [gameState.playerHero]);
    }
    
    const validTargets = attackableCells.filter(cell => {
        // Vérifier si la cellule contient le joueur
        return gameState.playerHero.x === cell.x && gameState.playerHero.y === cell.y;
    });
    
    if (validTargets.length > 0) {
        // Effectuer l'attaque
        const attackRoll = Math.floor(Math.random() * 6) + 1;
        let damage = 0;
        let message = `${enemy.name} attaque ! `;
        
        if (attackRoll <= 2) {
            message += `Attaque échouée (${attackRoll})`;
        } else if (attackRoll <= 5) {
            damage = Math.max(1, enemy.attack - gameState.playerHero.defense);
            if (gameState.playerHero.isDefending) {
                damage = Math.floor(damage * 0.5);
                gameState.playerHero.resetDefense();
            }
            message += `Attaque réussie (${attackRoll}) - ${damage} dégâts`;
        } else {
            damage = Math.max(1, (enemy.attack * 2) - gameState.playerHero.defense);
            if (gameState.playerHero.isDefending) {
                damage = Math.floor(damage * 0.5);
                gameState.playerHero.resetDefense();
            }
            message += `Coup critique (${attackRoll}) - ${damage} dégâts`;
        }
        
        gameState.playerHero.currentHealth -= damage;
        resultDisplay.textContent = message;
        updateEnemiesInfo();
        placeHeroes();
        updateHeroProfile();
        
        // Vérifier si le joueur est vaincu
        if (gameState.playerHero.currentHealth <= 0) {
            resultDisplay.textContent = "Vous avez été vaincu !";
            endGame(false);
            return;
        }
    } else {
        resultDisplay.textContent = `${enemy.name} n'a pas de cible à portée`;
    }
    
    // Passer au tour suivant après un court délai
    setTimeout(() => {
        nextTurn();
    }, 1500);
}

function enemyDefend(enemy) {
    enemy.defend();
    resultDisplay.textContent = `${enemy.name} se prépare à se défendre`;
    
    // Passer au tour suivant après un court délai
    setTimeout(() => {
        nextTurn();
    }, 1500);
}

function enemySpecialAttack(enemy) {
    if (!enemy.specialAvailable) {
        enemyTakeAction(enemy); // Choisir une autre action
        return;
    }
    
    // Utiliser le pouvoir spécial
    enemy.useSpecialAbility();
    
    if (enemy.type === 'Sorcier') {
        // Tempête Magique
        const attackableCells = enemy.getSpecialAttackRange();
        let totalDamage = 0;
        
        attackableCells.forEach(cell => {
            if (gameState.playerHero.x === cell.x && gameState.playerHero.y === cell.y) {
                const damage = Math.max(1, enemy.attack - gameState.playerHero.defense);
                if (gameState.playerHero.isDefending) {
                    damage = Math.floor(damage * 0.5);
                    gameState.playerHero.resetDefense();
                }
                gameState.playerHero.currentHealth -= damage;
                totalDamage += damage;
            }
        });
        
        if (totalDamage > 0) {
            resultDisplay.textContent = `${enemy.name} utilise Tempête Magique ! ${totalDamage} dégâts infligés`;
        } else {
            resultDisplay.textContent = `${enemy.name} utilise Tempête Magique mais vous rate`;
        }
    } else if (enemy.type === 'Ninja') {
        // Double attaque
        const attackableCells = enemy.getAttackableCells(gameState.arenaSize, [gameState.playerHero]);
        const canAttack = attackableCells.some(cell => 
            gameState.playerHero.x === cell.x && gameState.playerHero.y === cell.y
        );
        
        if (canAttack) {
            const damage = Math.max(1, (enemy.attack * 2) - gameState.playerHero.defense);
            if (gameState.playerHero.isDefending) {
                damage = Math.floor(damage * 0.5);
                gameState.playerHero.resetDefense();
            }
            gameState.playerHero.currentHealth -= damage;
            resultDisplay.textContent = `${enemy.name} utilise Double Attaque ! ${damage} dégâts infligés`;
        } else {
            resultDisplay.textContent = `${enemy.name} veut utiliser Double Attaque mais n'a pas de cible`;
        }
    } else if (enemy.type === 'Chevalier') {
        // Cri de Guerre
        const attackableCells = enemy.getAttackableCells(gameState.arenaSize, [gameState.playerHero]);
        const canAttack = attackableCells.some(cell => 
            gameState.playerHero.x === cell.x && gameState.playerHero.y === cell.y
        );
        
        if (canAttack) {
            const damage = Math.max(1, Math.floor((enemy.attack * 1.5) - gameState.playerHero.defense));
            if (gameState.playerHero.isDefending) {
                damage = Math.floor(damage * 0.5);
                gameState.playerHero.resetDefense();
            }
            gameState.playerHero.currentHealth -= damage;
            resultDisplay.textContent = `${enemy.name} utilise Cri de Guerre ! ${damage} dégâts infligés`;
        } else {
            resultDisplay.textContent = `${enemy.name} veut utiliser Cri de Guerre mais n'a pas de cible`;
        }
    }
    
    // Mettre à jour l'affichage
    updateEnemiesInfo();
    placeHeroes();
    updateHeroProfile();
    
    // Vérifier si le joueur est vaincu
    if (gameState.playerHero.currentHealth <= 0) {
        resultDisplay.textContent = "Vous avez été vaincu !";
        endGame(false);
        return;
    }
    
    // Passer au tour suivant après un court délai
    setTimeout(() => {
        nextTurn();
    }, 1500);
}

function endPlayerTurn() {
    if (gamePhase !== "playing" || currentPlayerTurn !== 0) return;
    
    // Réinitialiser les modes
    gameState.movingMode = false;
    gameState.attackingMode = false;
    gameState.specialAttackMode = false;
    gameState.isDefending = false;
    
    // Désactiver tous les boutons d'action
    document.getElementById('move-btn').disabled = true;
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('special-btn').disabled = true;
    document.getElementById('defend-btn').disabled = true;
    document.getElementById('end-turn-btn').disabled = true;
    
    // Passer au tour suivant
    nextTurn();
}

function nextTurn() {
    gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % gameState.turnOrder.length;
    const nextPlayer = gameState.turnOrder[gameState.currentTurnIndex];
    
    currentPlayerTurn = nextPlayer;
    startPlayerTurn(nextPlayer);
}

function endGame(victory) {
    gamePhase = "ended";
    
    // Désactiver tous les boutons
    document.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
    });

    // Créer un overlay plein écran
    const gameOverlay = document.createElement('div');
    gameOverlay.className = 'game-overlay';
    
    // Conteneur du message de fin
    const endContainer = document.createElement('div');
    endContainer.className = 'end-game-container';
    
    // Message de fin
    const message = document.createElement('div');
    message.className = `end-game-message ${victory ? 'victory' : 'defeat'}`;
    message.textContent = victory ? "Victoire Éclatante !" : "Défaite Amère...";
    
    // Sous-message
    const subMessage = document.createElement('div');
    subMessage.className = 'end-game-submessage';
    subMessage.textContent = victory ? "Vous avez triomphé de tous vos adversaires !" : "Votre héros a été vaincu au combat.";
    
    // Bouton Rejouer
    const restartBtn = document.createElement('button');
    restartBtn.className = 'restart-btn';
    restartBtn.textContent = "Rejouer";
    restartBtn.addEventListener('click', () => {
        document.body.removeChild(gameOverlay);
        initGame();
    });
    
    // Assemblage
    endContainer.appendChild(message);
    endContainer.appendChild(subMessage);
    endContainer.appendChild(restartBtn);
    gameOverlay.appendChild(endContainer);
    
    // Ajout à la page
    document.body.appendChild(gameOverlay);
}
// Démarrer le jeu
window.addEventListener('DOMContentLoaded', initGame);
