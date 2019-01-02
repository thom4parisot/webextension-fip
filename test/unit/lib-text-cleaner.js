import * as TextCleaner from '../../src/lib/text-cleaner.js';

describe('Text Cleaner', function(){

  //@see https://github.com/oncletom/chrome-fip/issues/23
  it('Cleaning PROMO', function(){
    expect(TextCleaner.doAlbumTitle('magical title')).to.equal('Magical Title');
    expect(TextCleaner.doAlbumTitle('magical title cd promo ')).to.equal('Magical Title');
    expect(TextCleaner.doAlbumTitle('magical title cd promo FIP')).to.equal('Magical Title');
    expect(TextCleaner.doAlbumTitle('magical title (cd promo)')).to.equal('Magical Title');
    expect(TextCleaner.doAlbumTitle('magical Title (cd promo fip) ')).to.equal('Magical Title');
    expect(TextCleaner.doAlbumTitle('magical Title (single promo) ')).to.equal('Magical Title');
    expect(TextCleaner.doAlbumTitle('magical Title single promo fip ')).to.equal('Magical Title');
    expect(TextCleaner.doAlbumTitle('magical promo single ')).to.equal('Magical Promo Single');
    expect(TextCleaner.doAlbumTitle('Pour Une Ame Souveraine (a Dedication To Nina Simone) (cd Promo)')).to.equal('Pour Une Ame Souveraine (A Dedication To Nina Simone)');
  });

  //@see https://github.com/oncletom/chrome-fip/issues/26
  it('Cleaning incomplete titles', function(){
    expect(TextCleaner.doTrackTitle('Beautiful Mongolian Horse (bonus Tra')).to.equal('Beautiful Mongolian Horse');
    expect(TextCleaner.doTrackTitle('Awesome flying cheese (whatever')).to.equal('Awesome Flying Cheese');
    expect(TextCleaner.doTrackTitle('Awesome flying wine (red of course)')).to.equal('Awesome Flying Wine (Red Of Course)');
    expect(TextCleaner.doTrackTitle('magical promo single ')).to.equal('Magical Promo');
  });

  //@see https://github.com/oncletom/chrome-fip/issues/25
  it('Cleaning artist names', function(){
    expect(TextCleaner.doArtistName('Musica Nuda/voi Peträ Magoni/ctb Ferruccio Spinetti/vib Daniele Di Gregorio/bat Balafon')).to.equal('Musica Nuda, Peträ Magoni, Ferruccio Spinetti, Daniele Di Gregorio, Balafon');
    expect(TextCleaner.doArtistName('Musica Nuda/Petra Magoni/Ferruccio Spinetti/ Daniele Di Gregorio/Balafon')).to.equal('Musica Nuda, Petra Magoni, Ferruccio Spinetti, Daniele Di Gregorio, Balafon');
    expect(TextCleaner.doArtistName(' Musica Nuda/Petra Magoni/Ferruccio Spinetti/ Daniele Di Gregorio/Balafon ')).to.equal('Musica Nuda, Petra Magoni, Ferruccio Spinetti, Daniele Di Gregorio, Balafon');
    expect(TextCleaner.doArtistName('Medeski/martin/wood ')).to.equal('Medeski, Martin, Wood');
    expect(TextCleaner.doArtistName(' Mark///Lion ')).to.equal('Mark///Lion');
    expect(TextCleaner.doArtistName('Mark///Lion')).to.equal('Mark///Lion');
    expect(TextCleaner.doArtistName('Lou Reed')).to.equal('Lou Reed');
    expect(TextCleaner.doArtistName('Nick///Bärtsch/Ronin')).to.equal('Nick///Bärtsch/Ronin');
    expect(TextCleaner.doArtistName('Serge Prokofiev/dir Lorin Maazel/orchestre National De France')).to.equal('Serge Prokofiev, Lorin Maazel, Orchestre National De France');
    expect(TextCleaner.doArtistName('Diego Jode de Salazar/dir Leonardo Garcia Alarcon/Cappella Mediterranea/sop Mariana Flores/hc Fabian Schofrin/tn Fernando Guimaraes/bas Matteo Bellotto')).to.equal('Diego Jode De Salazar, Leonardo Garcia Alarcon, Cappella Mediterranea, Mariana Flores, Fabian Schofrin, Fernando Guimaraes, Matteo Bellotto');
    expect(TextCleaner.doArtistName('Ji Mob/gui Matthieu Ouaki/bat Nico Rajao/bas Toskano Jeanniard/fl Ji Dru')).to.equal('Ji Mob, Matthieu Ouaki, Nico Rajao, Toskano Jeanniard, Ji Dru');
  });

  //@see https://github.com/oncletom/chrome-fip/issues/25
  it('Retrieving main artist name', function(){
    expect(TextCleaner.getMainArtistName('Musica Nuda/voi Petra Magoni/ctb Ferruccio Spinetti/vib Daniele Di Gregorio/bat Balafon')).to.equal('Musica Nuda');
    expect(TextCleaner.getMainArtistName('Musica Nuda/Petra Magoni/Ferruccio Spinetti/ Daniele Di Gregorio/Balafon')).to.equal('Musica Nuda');
    expect(TextCleaner.getMainArtistName('Medeski/martin/wood')).to.equal('Medeski');
    expect(TextCleaner.getMainArtistName('Mark///Lion')).to.equal('Mark///Lion');
    expect(TextCleaner.getMainArtistName('Lou Reed')).to.equal('Lou Reed');
    expect(TextCleaner.getMainArtistName('Nick///Bärtsch/Ronin')).to.equal('Nick///Bärtsch/Ronin');
    expect(TextCleaner.getMainArtistName('Serge Prokofiev/dir Lorin Maazel/orchestre National De France')).to.equal('Serge Prokofiev');
  });
});
