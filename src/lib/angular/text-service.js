import angular from 'angular';

export default angular.module('TextFilters', [])
  .filter('startsWith', function(){
    return (data, prefix) => Object.keys(data)
      .filter(key => key.indexOf(prefix) === 0)
      .reduce((obj, key) => Object.assign(obj, { [key]: data[key] }), {});
  })
