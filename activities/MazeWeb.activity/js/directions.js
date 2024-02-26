define(function (require) {

    var directions = {};

    directions.orders = ['north', 'east', 'south', 'west'];

    directions.orders.forEach(function (dir, i) {
        directions[dir] = i;
    });

    directions.getOpposite = function (direction) {
        switch(direction) {
        case 'north':
            return 'south';
            break;
        case 'south':
            return 'north';
            break;
        case 'east':
            return 'west';
            break;
        case 'west':
            return 'east';
            break;
        }
    }

    return directions;

});
