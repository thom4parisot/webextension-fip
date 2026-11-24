import angular from 'angular';

export default angular.module('TextFilters', [])
  .filter('startsWith', function(){
    return (data, prefix) => Object.keys(data)
      .filter(key => key.indexOf(prefix) === 0)
      .reduce((obj, key) => Object.assign(obj, { [key]: data[key] }), {});
  })
  // "artist, album, track": missing terms are skipped
  .filter('searchQuery', function(){
    return terms => encodeURIComponent(terms.filter(Boolean).join(', '));
  })
  // `&` or `+` in a name would otherwise cut, or alter, a query string parameter
  .filter('uriComponent', function(){
    return text => encodeURIComponent(text ?? '');
  });
