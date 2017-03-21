
// Syöte ----------------------------------------------------------------------

function Nappain() {
    this.painetut = {};

    this.VASEN = 37;
    this.YLOS = 38;
    this.OIKEA = 39;
    this.ALAS = 40;

}

Nappain.prototype.painettu = function(koodi) {
    return this.painetut[koodi];
};

Nappain.prototype.painettaessa = function(tapahtuma) {
    this.painetut[tapahtuma.keyCode] = true;
};

Nappain.prototype.irrottaessa = function(tapahtuma) {
    delete this.painetut[tapahtuma.keyCode];
};

function assosioiNappain(nappain) {
    window.addEventListener('keyup', function(event) { nappain.irrottaessa(event); }, false);
    window.addEventListener('keydown', function(event) { nappain.painettaessa(event); }, false);
}

