
// Globaali canvas ja konteksti
var canvas = document.getElementById("tetrisCanvas");
var context = canvas.getContext("2d");

// Util -----------------------------------------------------------------------

// Lähde (16.3.2017):
// http://stackoverflow.com/a/966938
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

// Lähde (18.3.2017):
// http://stackoverflow.com/a/17243070
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// Lähde (18.3.2017):
// http://stackoverflow.com/a/5624139
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// Lähde (18.3.2017):
// http://stackoverflow.com/a/5624139
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Vec2 -----------------------------------------------------------------------

// Minimaalinen säiliöluokka 2-ulotteiselle vektorille, en uskalla vielä tehdä
// parempaa
function Vec2(x, y) {
    this.x = x;
    this.y = y;
}

Vec2.prototype.summa = function(b) {
    this.x += b.x;
    this.y += b.y;
};

// Syöte ----------------------------------------------------------------------

var Nappain = {
    VASEN:37,
    YLOS:38,
    OIKEA:39,
    ALAS:40
}

// Piirtometodit ---------------------------------------------------------------

function piirraPala(x, y, w, h, vari) {
    var palanKoko = new Vec2(canvas.width/w, canvas.height/h);
    var paikkaRuudulla = new Vec2(x * palanKoko.x, y * palanKoko.y);

    context.beginPath();
    context.rect(paikkaRuudulla.x, paikkaRuudulla.y, palanKoko.x, palanKoko.y);
    context.fillStyle = vari;
    context.fill();
    context.closePath();
}

function piirraTeksti(x, y, teksti) {
    context.fillStyle = "#FFFFFF";
    context.strokeStyle = "#000000";
    context.fillText(teksti, x, y);
    context.strokeText(teksti, x, y);
}

// Kentta ---------------------------------------------------------------------

function Kentta(w, h) {
    this.koko = new Vec2(w, h);
    this.kentta = createArray(this.koko.x, this.koko.y);
    for (var x = 0; x < this.koko.x; x++) {
        this.kentta[x].fill(0);
    }
    //this.kentta[2][5] = "#00FF00";
}

Kentta.prototype.piirra = function() {
    for (var x = 0; x < this.koko.x; x++) {
        for (var y = 0; y < this.koko.y; y++) {
            var arvo = this.kentta[x][y];

            if (arvo == 0) {
                continue;
            }

            piirraPala(x, y, this.koko.x, this.koko.y, arvo);
        }
    }
};

Kentta.prototype.onkoVapaa = function(x, y) {
    console.log("Kentta.onkoVapaa: Paikka sisältää: " + this.kentta[x][y]);
    return (this.kentta[x][y] == 0);
};

Kentta.prototype.aseta = function(x, y, vari) {
    if (this.onkoVapaa(x, y)) {
        this.kentta[x][y] = vari;
        return false;
    }
    console.log("Kentta.aseta: paikka ei ollut vapaa.");
    // Haluttu paikka on jo peitossa!
    return true;
};

Kentta.prototype.poista = function(x, y) {
    this.kentta[x][y] = 0;
};

// Tetromino ------------------------------------------------------------------

function Tetromino(tyyppi, vari, kentta) {
    this.varatutTilat = [[], [], [], []];
    this.paikka = new Vec2(Math.floor(kentta.koko.x/2)-1, 0);
    this.kierto = 0;
    this.vari = vari;
    this.kentta = kentta;

    switch (tyyppi) {
        //
        // xxxx
        default:
        case 0:
            this.varatutTilat = [
                [new Vec2(-1, 0), new Vec2(0, 0), new Vec2(1, 0), new Vec2(2, 0)],
                [new Vec2(0, 0), new Vec2(0, 1), new Vec2(0, 2), new Vec2(0, 3)],
                [],
                []
            ];
            this.varatutTilat[2] = this.varatutTilat[0].slice();
            this.varatutTilat[3] = this.varatutTilat[1].slice();
            break;

        // x
        // xxx
        case 1:
            this.varatutTilat = [
                [new Vec2(0, 0), new Vec2(0, 1), new Vec2(1, 1), new Vec2(2, 1)],
                [new Vec2(0, 0), new Vec2(1, 0), new Vec2(0, 1), new Vec2(0, 2)],
                [new Vec2(-2, 0), new Vec2(-1, 0), new Vec2(0, 0), new Vec2(0, 1)],
                [new Vec2(1, 0), new Vec2(1, 1), new Vec2(1, 2), new Vec2(0, 2)]
            ];
            break;

        //   x
        // xxx
        case 2:
            this.varatutTilat = [
                [new Vec2(2, 0), new Vec2(0, 1), new Vec2(1, 1), new Vec2(2, 1)],
                [new Vec2(0, 0), new Vec2(0, 1), new Vec2(0, 2), new Vec2(1, 2)],
                [new Vec2(0, 0), new Vec2(1, 0), new Vec2(2, 0), new Vec2(0, 1)],
                [new Vec2(0, 0), new Vec2(1, 0), new Vec2(1, 1), new Vec2(1, 2)]
            ];
            break;

        // xx
        // xx
        case 3:
            this.varatutTilat = [
                [new Vec2(0, 0), new Vec2(1, 0), new Vec2(0, 1), new Vec2(1, 1)],
                [],
                [],
                []
            ];
            this.varatutTilat[1] = this.varatutTilat[0].slice();
            this.varatutTilat[2] = this.varatutTilat[0].slice();
            this.varatutTilat[3] = this.varatutTilat[0].slice();
            break;

        //  xx
        // xx
        case 4:
            this.varatutTilat = [
                [new Vec2(1, 0), new Vec2(2, 0), new Vec2(0, 1), new Vec2(1, 1)],
                [new Vec2(0, 0), new Vec2(0, 1), new Vec2(1, 1), new Vec2(1, 2)],
                [],
                []
            ];
            this.varatutTilat[2] = this.varatutTilat[0].slice();
            this.varatutTilat[3] = this.varatutTilat[1].slice();
            break;

        //  x
        // xxx
        case 5:
            this.varatutTilat = [
                [new Vec2(0, 0), new Vec2(-1, 1), new Vec2(0, 1), new Vec2(1, 1)],
                [new Vec2(0, 0), new Vec2(0, 1), new Vec2(1, 1), new Vec2(0, 2)],
                [new Vec2(-1, 0), new Vec2(0, 0), new Vec2(1, 0), new Vec2(0, 1)],
                [new Vec2(1, 0), new Vec2(0, 1), new Vec2(1, 1), new Vec2(1, 2)]
            ];
            break;

        // xx
        //  xx
        case 6:
            this.varatutTilat = [
                [new Vec2(0, 0), new Vec2(1, 0), new Vec2(1, 1), new Vec2(2, 1)],
                [new Vec2(1, 0), new Vec2(0, 1), new Vec2(1, 1), new Vec2(0, 2)],
                [],
                []
            ];
            this.varatutTilat[2] = this.varatutTilat[0].slice();
            this.varatutTilat[3] = this.varatutTilat[1].slice();
            break;
    }
}

Tetromino.prototype.leikkaa = function() {
    var varatutTilatKoko = this.varatutTilat[this.kierto].length;

    // Testataan palojen tilat
    for (var i = 0; i < varatutTilatKoko; i++) {
        var paikkaKentalla = this.varatutTilat[this.kierto][i];
        paikkaKentalla.summa(this.paikka);

        if (!this.kentta.onkoVapaa(paikkaKentalla.x, paikkaKentalla.y)) {
            // Tälle palalle ei ole tilaa, palauta virhe
            return true;
        }
    }

    return false;
};

Tetromino.prototype.aseta = function() {
    var varatutTilatKoko = this.varatutTilat[this.kierto].length;

    // Testataan ensin palojen tilat
    if (this.leikkaa()) {
        console.log("Tetromino.aseta: ei voi asettaa, tetromino leikkaa jo!");
        return true;
    }

    // Sitten asetetaan palat
    for (var i = 0; i < varatutTilatKoko; i++) {
        var paikkaKentalla = this.varatutTilat[this.kierto][i];
        paikkaKentalla.summa(this.paikka);

        if (this.kentta.aseta(paikkaKentalla.x, paikkaKentalla.y, this.vari)) {
            // Ei pitäisi tapahtua mutta handlataan silti
            console.log("Tetromino.aseta: kentta ei ottanut palaa vastaan!");
            return true;
        }
    }

    return false;
};

Tetromino.prototype.poista = function() {
    var varatutTilatKoko = this.varatutTilat[this.kierto].length;

    // Poistetaan palat
    for (var i = 0; i < varatutTilatKoko; i++) {
        var paikkaKentalla = this.varatutTilat[this.kierto][i];
        paikkaKentalla.summa(this.paikka);

        this.kentta.poista(paikkaKentalla.x, paikkaKentalla.y);
    }
};

Tetromino.prototype.siirra = function(x, y) {
    var varatutTilatKoko = this.varatutTilat[this.kierto].length;

    // Tarkistukset
    for (var i = 0; i < varatutTilatKoko; i++) {
        var paikkaKentalla = this.varatutTilat[this.kierto][i];
        paikkaKentalla.summa(this.paikka);

        var uusiPaikkaKentalla = new Vec2(paikkaKentalla.x + x, paikkaKentalla.y + y);

        // Tarkistetaan pelialueen rajojen ylityset
        if (uusiPaikkaKentalla.x < 0 || uusiPaikkaKentalla.x >= this.kentta.koko.x) {
            return true;
        }

        if (uusiPaikkaKentalla.y < 0 || uusiPaikkaKentalla.y >= this.kentta.koko.y) {
            return true;
        }

        // Sitten tarkistetaan edellisten palojen leikkaukset
        if (!this.kentta.onkoVapaa(uusiPaikkaKentalla.x, uusiPaikkaKentalla.y)) {
            //Tälle palalle ei ole tilaa, palauta virhe
            return true;
        }
    }

    // Ja siirretään sitten palat
    this.paikka.summa(new Vec2(x, y));

    // Onnistui
    return false;
};

Tetromino.prototype.kierra = function(suunta) {
    this.kierto += suunta;

    if (this.kierto > 3) {
        this.kierto = 0;
    } else if (this.kierto < 0) {
        this.kierto = 3;
    }
};

Tetromino.prototype.piirra = function() {
    var varatutTilatKoko = this.varatutTilat[this.kierto].length;
    for (var i = 0; i < varatutTilatKoko; i++) {
        var paikkaKentalla = this.varatutTilat[this.kierto][i];
        paikkaKentalla.summa(this.paikka);

        piirraPala(paikkaKentalla.x, paikkaKentalla.y, this.kentta.koko.x, this.kentta.koko.y, this.vari);
    }
};

// Peli -----------------------------------------------------------------------

function Peli() {
    this.havitty = false;
    this.pisteet = 0;
    this.koko = new Vec2(12, 16);
    this.kentta = new Kentta(this.koko.x, this.koko.y);
    this.aktiivinenTetromino = 0;
}

Peli.prototype.vaihdaTetromino = function() {
    var tyyppi = Math.floor(Math.random() * 7);
    var variRgb = HSVtoRGB(Math.random(), 0.5, 0.8);
    this.aktiivinenTetromino = new Tetromino(tyyppi, rgbToHex(variRgb.r, variRgb.g, variRgb.b), this.kentta);

    //Onko pelin kenttä jo liian täynnä?
    this.havitty = this.aktiivinenTetromino.leikkaa();
};

Peli.prototype.syoteTapahtuma = function(event) {
    if (this.havitty != true) {
        // Käsitellään syöte
        switch (event.keyCode) {
            case Nappain.VASEN:
                this.aktiivinenTetromino.siirra(-1, 0);
                break;
            case Nappain.OIKEA:
                this.aktiivinenTetromino.siirra(1, 0);
                break;
            case Nappain.ALAS:
                while (!this.aktiivinenTetromino.siirra(0, 1));
                break;
            default:
        }
    }
};

Peli.prototype.paivita = function(nappain) {
    if (this.havitty != true) {
        // Siirretään tetrominoa alas, jos ei voi enää niin otetaan uusi
        if (this.aktiivinenTetromino.siirra(0, 1)) {
            console.log("Tetrominoa ei voi enää pudottaa, tehdään uusi");
            this.aktiivinenTetromino.aseta();
            this.vaihdaTetromino();
        }
    }
};

Peli.prototype.piirra = function() {
    context.textAlign = "left";
    piirraTeksti(0, 0, "pisteet: " + this.pisteet);

    if (this.havitty == true) {
        context.textAlign = "center";
        piirraTeksti(canvas.width/2, canvas.height/2, "Hävisit pelin!");
    } else {
        // Piirretään pelin grafiikat
        this.kentta.piirra();
        this.aktiivinenTetromino.piirra();
    }
};

// Pelin alku -----------------------------------------------------------------

var peli = new Peli();
peli.vaihdaTetromino();
window.addEventListener('keydown', function(event) { peli.syoteTapahtuma(event); }, false);

function piirra() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    peli.piirra();
}

function paivita() {
    peli.paivita();
}

context.font = '26px sans-serif';
context.textBaseline = "hanging";
setInterval(piirra, 33);
setInterval(paivita, 500);
