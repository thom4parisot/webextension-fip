"use strict";

suite('Text Cleaner', function(){

  //@see https://github.com/oncletom/chrome-fip/issues/23
  test('Cleaning PROMO', function(){
    expect(TextCleaner.doAlbumTitle('magical title')).to.be('magical title');
    expect(TextCleaner.doAlbumTitle('magical title cd promo ')).to.be('magical title');
    expect(TextCleaner.doAlbumTitle('magical title cd promo FIP')).to.be('magical title');
    expect(TextCleaner.doAlbumTitle('magical title (cd promo)')).to.be('magical title');
    expect(TextCleaner.doAlbumTitle('magical title (cd promo fip) ')).to.be('magical title');
    expect(TextCleaner.doAlbumTitle('magical title (single promo) ')).to.be('magical title');
    expect(TextCleaner.doAlbumTitle('magical title single promo fip ')).to.be('magical title');
    expect(TextCleaner.doAlbumTitle('magical promo single ')).to.be('magical promo single');
  });

  //@see https://github.com/oncletom/chrome-fip/issues/26
  test('Cleaning incomplete titles', function(){
    expect(TextCleaner.doTrackTitle('Beautiful Mongolian Horse (bonus Tra')).to.be('Beautiful Mongolian Horse');
    expect(TextCleaner.doTrackTitle('Awesome flying cheese (whatever')).to.be('Awesome flying cheese');
    expect(TextCleaner.doTrackTitle('Awesome flying wine (red of course)')).to.be('Awesome flying wine (red of course)');
    expect(TextCleaner.doTrackTitle('magical promo single ')).to.be('magical promo single');
  });

  //@see https://github.com/oncletom/chrome-fip/issues/25
  test('Cleaning artist names', function(){
    expect(TextCleaner.doArtistName('Musica Nuda/voi Peträ Magoni/ctb Ferruccio Spinetti/vib Daniele Di Gregorio/bat Balafon')).to.be('Musica Nuda, Peträ Magoni, Ferruccio Spinetti, Daniele Di Gregorio, Balafon');
    expect(TextCleaner.doArtistName('Musica Nuda/Petra Magoni/Ferruccio Spinetti/ Daniele Di Gregorio/Balafon')).to.be('Musica Nuda, Petra Magoni, Ferruccio Spinetti, Daniele Di Gregorio, Balafon');
    expect(TextCleaner.doArtistName(' Musica Nuda/Petra Magoni/Ferruccio Spinetti/ Daniele Di Gregorio/Balafon ')).to.be('Musica Nuda, Petra Magoni, Ferruccio Spinetti, Daniele Di Gregorio, Balafon');
    expect(TextCleaner.doArtistName('Medeski/martin/wood ')).to.be('Medeski, martin, wood');
    expect(TextCleaner.doArtistName(' Mark///Lion ')).to.be('Mark///Lion');
    expect(TextCleaner.doArtistName('Mark///Lion')).to.be('Mark///Lion');
    expect(TextCleaner.doArtistName('Lou Reed')).to.be('Lou Reed');
    expect(TextCleaner.doArtistName('Nick///Bärtsch/Ronin')).to.be('Nick///Bärtsch/Ronin');
    expect(TextCleaner.doArtistName('Serge Prokofiev/dir Lorin Maazel/orchestre National De France')).to.be('Serge Prokofiev, Lorin Maazel, orchestre National De France');
  });

  //@see https://github.com/oncletom/chrome-fip/issues/25
  test('Retrieving main artist name', function(){
    expect(TextCleaner.getMainArtistName('Musica Nuda/voi Petra Magoni/ctb Ferruccio Spinetti/vib Daniele Di Gregorio/bat Balafon')).to.be('Musica Nuda');
    expect(TextCleaner.getMainArtistName('Musica Nuda/Petra Magoni/Ferruccio Spinetti/ Daniele Di Gregorio/Balafon')).to.be('Musica Nuda');
    expect(TextCleaner.getMainArtistName('Medeski/martin/wood')).to.be('Medeski');
    expect(TextCleaner.getMainArtistName('Mark///Lion')).to.be('Mark///Lion');
    expect(TextCleaner.getMainArtistName('Lou Reed')).to.be('Lou Reed');
    expect(TextCleaner.getMainArtistName('Nick///Bärtsch/Ronin')).to.be('Nick///Bärtsch/Ronin');
    expect(TextCleaner.getMainArtistName('Serge Prokofiev/dir Lorin Maazel/orchestre National De France')).to.be('Serge Prokofiev');
  });
});
