import {doAlbumTitle, doTrackTitle, doArtistName, getMainArtistName} from './text-cleaner.js';

describe('Text Cleaner', function(){

  //@see https://github.com/oncletom/webextension-fip/issues/23
  it('Cleaning PROMO', function(){
    expect(doAlbumTitle('magical title')).toEqual('Magical Title');
    expect(doAlbumTitle('magical title cd promo ')).toEqual('Magical Title');
    expect(doAlbumTitle('magical title cd promo FIP')).toEqual('Magical Title');
    expect(doAlbumTitle('magical title (cd promo)')).toEqual('Magical Title');
    expect(doAlbumTitle('magical Title (cd promo fip) ')).toEqual('Magical Title');
    expect(doAlbumTitle('magical Title (single promo) ')).toEqual('Magical Title');
    expect(doAlbumTitle('magical Title single promo fip ')).toEqual('Magical Title');
    expect(doAlbumTitle('magical promo single ')).toEqual('Magical Promo Single');
    expect(doAlbumTitle('Pour Une Ame Souveraine (a Dedication To Nina Simone) (cd Promo)')).toEqual('Pour Une Ame Souveraine (A Dedication To Nina Simone)');
  });

  //@see https://github.com/oncletom/webextension-fip/issues/26
  it('Cleaning incomplete titles', function(){
    expect(doTrackTitle('Beautiful Mongolian Horse (bonus Tra')).toEqual('Beautiful Mongolian Horse');
    expect(doTrackTitle('Awesome flying cheese (whatever')).toEqual('Awesome Flying Cheese');
    expect(doTrackTitle('Awesome flying wine (red of course)')).toEqual('Awesome Flying Wine (Red Of Course)');
    expect(doTrackTitle('magical promo single ')).toEqual('Magical Promo');
  });

  //@see https://github.com/oncletom/webextension-fip/issues/25
  it('Cleaning artist names', function(){
    expect(doArtistName('Musica Nuda/voi Peträ Magoni/ctb Ferruccio Spinetti/vib Daniele Di Gregorio/bat Balafon')).toEqual('Musica Nuda, Peträ Magoni, Ferruccio Spinetti, Daniele Di Gregorio, Balafon');
    expect(doArtistName('Musica Nuda/Petra Magoni/Ferruccio Spinetti/ Daniele Di Gregorio/Balafon')).toEqual('Musica Nuda, Petra Magoni, Ferruccio Spinetti, Daniele Di Gregorio, Balafon');
    expect(doArtistName(' Musica Nuda/Petra Magoni/Ferruccio Spinetti/ Daniele Di Gregorio/Balafon ')).toEqual('Musica Nuda, Petra Magoni, Ferruccio Spinetti, Daniele Di Gregorio, Balafon');
    expect(doArtistName('Medeski/martin/wood ')).toEqual('Medeski, Martin, Wood');
    expect(doArtistName(' Mark///Lion ')).toEqual('Mark///Lion');
    expect(doArtistName('Mark///Lion')).toEqual('Mark///Lion');
    expect(doArtistName('Lou Reed')).toEqual('Lou Reed');
    expect(doArtistName('Nick///Bärtsch/Ronin')).toEqual('Nick///Bärtsch/Ronin');
    expect(doArtistName('Serge Prokofiev/dir Lorin Maazel/orchestre National De France')).toEqual('Serge Prokofiev, Lorin Maazel, Orchestre National De France');
    expect(doArtistName('Diego Jode de Salazar/dir Leonardo Garcia Alarcon/Cappella Mediterranea/sop Mariana Flores/hc Fabian Schofrin/tn Fernando Guimaraes/bas Matteo Bellotto')).toEqual('Diego Jode De Salazar, Leonardo Garcia Alarcon, Cappella Mediterranea, Mariana Flores, Fabian Schofrin, Fernando Guimaraes, Matteo Bellotto');
    expect(doArtistName('Ji Mob/gui Matthieu Ouaki/bat Nico Rajao/bas Toskano Jeanniard/fl Ji Dru')).toEqual('Ji Mob, Matthieu Ouaki, Nico Rajao, Toskano Jeanniard, Ji Dru');
  });

  //@see https://github.com/oncletom/webextension-fip/issues/25
  it('Retrieving main artist name', function(){
    expect(getMainArtistName('Musica Nuda/voi Petra Magoni/ctb Ferruccio Spinetti/vib Daniele Di Gregorio/bat Balafon')).toEqual('Musica Nuda');
    expect(getMainArtistName('Musica Nuda/Petra Magoni/Ferruccio Spinetti/ Daniele Di Gregorio/Balafon')).toEqual('Musica Nuda');
    expect(getMainArtistName('Medeski/martin/wood')).toEqual('Medeski');
    expect(getMainArtistName('Mark///Lion')).toEqual('Mark///Lion');
    expect(getMainArtistName('Lou Reed')).toEqual('Lou Reed');
    expect(getMainArtistName('Nick///Bärtsch/Ronin')).toEqual('Nick///Bärtsch/Ronin');
    expect(getMainArtistName('Serge Prokofiev/dir Lorin Maazel/orchestre National De France')).toEqual('Serge Prokofiev');
  });
});
