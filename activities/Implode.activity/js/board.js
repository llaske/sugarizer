function Board(){
    //  Board is represented as a dict from x coordinates to lists representing
    //  columns of pieces.  The beginning of the lists are the value of the piece
    //  in the column at y=0, and subsequent values are for increasing values of
    //  y.  Missing values are represented either with None in the column list or
    //  a missing column in the dict.

    this._data = {}

    this.repeat = function (arr, n){
        var a = [];
        for (var i=0;i<n;[i++].push.apply(a,arr));
        return a;
    }

    this.get_value = function(x, y){

        // Return the value at coordinate (x,y), or undefined if no value is
        // present.
        var col = this._data[x]
        if(col == undefined)
            return undefined
        if((0 <= y) && (y < col.length)){
            return col[y]
        }
        else
            return undefined
    }


    this.set_value = function(x, y, value){
        // Set the value at coordinate (x,y) to the given value.
        // assert y >= 0
        if(y >= 0){

            var col = this._data[x]
            if(col == undefined){
                if(value !== undefined){
                    var arr = this.repeat([undefined] , y)
                    arr = arr.concat([value])
                    this._data[x] =  arr
                }
            }
            else if(y < col.length){
                col[y] = value
                if(value == undefined)
                    this._trim_column(x)
            }
            else if(value == undefined){}
            else{
                col = col.concat(this.repeat([undefined] , (y - col.length)))
                col = col.concat([value])
                this._data[x] = col
            }

        }
    }

    this.get_column_height = function(x){
        // Return the height of column x.

        col = this._data[x]
        if(col == undefined)
            return 0
        else
            return col.length
    }

    this.width = function(){
        return (this.max_x() - this.min_x())
    }

    this.height = function(){
        return (this.max_y() - this.min_y())
    }

    this.min_x = function(){
        if(Object.keys(this._data).length == 0)
            return 0
        else{
            var keys_arr = Object.keys(this._data)
            for(var i=0;i<keys_arr.length;i++){
                keys_arr[i] = parseInt(keys_arr[i])
            }
            return Math.min(0, Math.min(...keys_arr))
        }
    }

    this.max_x = function(){
        if(Object.keys(this._data).length == 0)
            return 0
        else{
            var keys_arr = Object.keys(this._data)
            for(var i=0;i<keys_arr.length;i++){
                keys_arr[i] = parseInt(keys_arr[i])
            }
            return Math.max(0, Math.max(...keys_arr)) + 1
        }
    }

    this.min_y = function(){
        return 0
    }

    this.max_y = function(){
        if(Object.keys(this._data).length == 0)
            return 0
        else{
            var value_arr = Object.values(this._data)
            var len_arr = []
            for(var col=0;col<value_arr.length;col++){
                len_arr[col] = value_arr[col].length
            }
            return Math.max(0, Math.max(...len_arr))
        }
    }

    this.is_empty = function(){
        return (Object.keys(this._data).length == 0)
    }

    this.get_col_value = function(x){
        return this._data[x]
    }

    this._trim_column = function(x){
        // Removes any undefined values at the top of the given column, removing the
        // column array entirely if it is empty
        var col = this._data[x]
        if(col[col.length-1] !== undefined){
            return
        }
        var arr = [...Array(col.length).keys()].reverse()
        for(var i in arr){
            i = parseInt(i);
            i = arr[i]
            if(col[i] !== undefined){
                this._data[x] = col.slice(0,i + 1)
                return
            }
        }
        
        delete this._data[x]
    }

    this.items = function(){

        var new_arr = []
        var arr = Object.keys(this._data)
        for(var i in arr){
            i = parseInt(i)
            new_arr.push([parseInt(arr[i]), this._data[parseInt(arr[i])]])
        }

        return new_arr
    }

    this.insert_columns = function(col_index, num_columns){
        // Inserts empty columns at the given index, pushing higher-numbered
        // columns higher

        // assert num_columns >= 0
        if(num_columns >= 0){
            var new_data = {}
            var arr = this.items();
            for(var k in arr){
                k = parseInt(k)
                var i = arr[k][0]
                var col = arr[k][1]
                if( i < col_index){
                    new_data[i] = col
                }
                else{
                    new_data[i + num_columns] = col
                }
            }
            this._data = JSON.parse(JSON.stringify(new_data))
        }
    }

    this.simplify = function(){

        var keys = Object.keys(this._data);
        for(var i in keys){
            i = parseInt(i)
            i = keys[i]
            for(var j=0;j<this._data[i].length;j++){
                var value = this._data[i][j];
                if((value == -1) || (value == undefined) || (value == null)){
                    this._data[i].splice(j,1);
                    j = j-1;
                }
            }
            if(this._data[i].length == 0){
                delete this._data[i];
            }
        }
        keys = Object.keys(this._data);
        for(var i=0;i<keys.length;i++){
            if(i == parseInt(keys[i])){}
            else{
                this._data[i] = this._data[parseInt(keys[i])];
                delete this._data[parseInt(keys[i])];
                // i = i-1;
            }
        }
    }

    this.__repr__ = function(){
        var width = this.width()
        var height = this.height()
        var lines = []
        for(var i in [...Array(height).keys()]){
            var line = []
            for(j in [...Array(width).keys()]){
                i = parseInt(i)
                j = parseInt(j)
                var value = this.get_value(j, i)
                if(value == undefined)
                    line.push('.')
                else if(value == -1)
                    line.push('*')
                else
                    line.push(value.toString())
            }
            lines.push(line.join(''))
        }
        lines.reverse()
        return lines.join('\n')
    }

}

var max_size = [];
function generate_board(fragmentation=0,max_colors=5,size=[30, 20]) {
    // Generates a new board of the given properties using the given random
    // seed as a starting point.  Returns both the board and the list of
    // moves needed to solve it.
    
    max_size = size;
    var piece_sizes = _get_piece_sizes(fragmentation);
    var b = new Board()
    var winning_moves = []
    for(var piece_size in piece_sizes){
        piece_size  = parseInt(piece_size)
        var arr = _try_add_piece(b, parseInt(piece_sizes[piece_size]), max_colors, max_size)
        var b = arr[0]
        var move = arr[1]
        if(move !== undefined){
            winning_moves.splice(0, 0,move)
        }
    }
    return [b, winning_moves]
}

function _try_add_piece(b, piece_size, max_colors, max_size){

    // Tries to add a piece of the given size to the board.  Returns the
    // modified board on success or the original board on failure.
    // Also returns the lowest coordinate of the added piece (i.e. the canonical
    // move to remove it) or undefined if no piece added.

    var b2 = new Board();
    b2._data = JSON.parse(JSON.stringify(b._data))
    var change = _get_starting_change(b2, max_colors, max_size)
    if(change == undefined){
        return [b, undefined]
    }
    _make_change(b2, change)
    var total_added_cells = 1
    while(total_added_cells < piece_size){
        var added_cells = _try_add_cells(b2, max_colors, max_size)
        if(added_cells > 0){
            total_added_cells += added_cells
        }
        else{
            if(total_added_cells >= 3)
                break
            else{
                return [b, undefined]
            }
        }
    }
    var piece = _get_new_piece_coords(b2)
    var min_piece = piece[0]
    for(var i=1;i<piece.length;i++){
        if((piece[i][0]<min_piece[0])&& (piece[i][1] < min_piece[1])){
            min_piece = piece[i]
        }
    }
    _color_piece_random(b2, max_colors)
    return [b2, min_piece]
}

function arrayRemove(arr, value) { 
    return arr.filter(function(ele){ return ele != value; });
}

function choice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function _get_starting_change(b, max_colors, max_size){
    // Gets a valid initial change that adds a one-cell colorable piece to the
    // board, returning undefined if no such starting change exists.

    var changes = _enumerate_one_cell_changes(b, max_size)
    while(changes.length > 0){
        var change = choice(changes)
        changes = arrayRemove(changes, change)
        if(_change_is_colorable(b, change, max_colors)){
            return change
        }
    }
    return undefined
}

function _enumerate_one_cell_changes(b, max_size){
    // Returns a list of all possible one-cell changes.

    var max_width = max_size[0]
    var max_height = max_size[1]
    var changes = []
    var width = b.width()
    if (width < max_width && max_height >= 1){
        var arr = [...Array(width+1).keys()]
        for(var i in arr){
            i = parseInt(i)
            var obj = new _InsertColumnChange(arr[i], 1)
            changes.push(obj)
        }
    }
    var arr = [...Array(width).keys()]
    for (var i in arr){
        i = parseInt(i)
        var col_height = b.get_column_height(arr[i])
        if(col_height < max_height){
            var height_arr = [...Array(col_height +1).keys()]
            for(var j in height_arr){
                j = parseInt(j)
                var obj = new _InsertCellChange(arr[i], height_arr[j])
                changes.push(obj)
            }
        }
    }
    return changes;
}

function _try_add_cells(b, max_colors, max_size){
    // Tries to add a cell or cells to the new piece on the board in a way that
    // ensures the resulting board is within the given board size and is
    // colorable with the given colors.  Returns the number of cells added
    // (zero, if no cell could be added).
    var a = _get_cell_changes(b, max_size)
    var cell_h_changes = a[0]
    var cell_v_changes = a[1]
    var col_changes = _get_col_changes(b, max_size)
    while (cell_h_changes.length > 0 ||
           cell_v_changes.length > 0 ||
           col_changes.length > 0){

        var change = _remove_change(cell_h_changes, cell_v_changes, col_changes)
        if(_change_is_colorable(b, change, max_colors)){
            _make_change(b, change)
            if(change instanceof _InsertCellChange){
                return 1
            }
            else{
                return change.height
            }
        }

    }
    return 0
}

function _get_cell_changes(b, max_size){
    // Returns a list of all possible standard cell insertions.
    var max_width = max_size[0]
    var max_height = max_size[1]
    var h_changes = []
    var v_changes = []
    var width = b.width()
    for(var i in [...Array(width).keys()]){
        i = parseInt(i)
        var col_height = b.get_column_height(i)
        if(col_height < max_height){
            for(var j in [...Array(col_height + 1).keys()]){
                j = parseInt(j)
                if(b.get_value(i, j) != -1){
                    if (b.get_value(i + 1, j) == -1 ||
                            b.get_value(i - 1, j) == -1){
                                var obj = new _InsertCellChange(i, j)
                                h_changes.push(obj)
                        }
                    else if (b.get_value(i, j - 1) == -1 ||
                          b.get_value(i, j + 1) == -1){
                            var obj = new _InsertCellChange(i, j)
                            v_changes.push(obj)
                          }
                }
            }
        }
    }
    return [h_changes, v_changes]
}

function _get_col_changes(b, max_size){
    // Returns a list of all possible column insertions.

    var max_width = max_size[0]
    var max_height = max_size[1]
    var width = b.width()
    if(width == max_width || max_height < 1){
        return []
    }
    var highest_new_pieces = []
    for(var i in [...Array(width).keys()]){
        i = parseInt(i)
        var col_height = b.get_column_height(i)
        var highest_new_piece = 0
        for(var j in  [...Array(col_height).keys()]){
            j = parseInt(j)
            var value = b.get_value(i, j)
            if(value == -1){
                highest_new_piece = j + 1
            }
        }
        highest_new_pieces.push(highest_new_piece)
    }
    var changes = []
    var arr1 = highest_new_pieces.concat([0])
    var arr2 = [0].concat(highest_new_pieces)
    var arr = [arr1,arr2]
    var transposed = arr.reduce((r, a) => a.map((v, i) => (r[i] || []).concat(v)), []);
    for (var i in transposed){
        i = parseInt(i)
        var height1 = transposed[i][0]
        var height2 = transposed[i][1]
        var height = Math.max(height1, height2)
        if(height > 0){
            var obj = new _InsertColumnChange(i, height)
            changes.push(obj)
        }
    }
    return changes
}

function _remove_change(cell_h_changes, cell_v_changes, col_changes){
    // Removes a change from cell changes or col changes (less likely) and
    // returns it.

    var h_weight = cell_h_changes.length * 10
    var v_weight = cell_v_changes.length * 5
    var col_weight = col_changes.length * 1
    var value = Math.floor(Math.random() * (h_weight + v_weight + col_weight));
    if(value < h_weight){
        return _pick(cell_h_changes)
    }
    else if(value < (h_weight + v_weight)){
        return _pick(cell_v_changes)
    }
    else{
        return _pick(col_changes)
    }
}

function _pick(items){
    var index = Math.floor(Math.random() * (items.length));
    if(items[index]){
        return items.splice(index,1)[0]
    }
    else{
        return items.pop();
    }
}

function _change_is_colorable(b, change, max_colors){
    // Returns True if the board is still colorable after the given change is
    // made, False otherwise.

    var b2 = new Board();
    b2._data = JSON.parse(JSON.stringify(b._data))
    _make_change(b2, change)
    var colors = _get_new_piece_colors(b2, max_colors)
    return colors.length > 0
}

function _make_change(b, change){
    // Makes the given change to the board (side-affects board parameter).

    if (change instanceof _InsertColumnChange){
        b.insert_columns(change.col, 1)
        b._data = JSON.parse(JSON.stringify(b._data))
        var arr = [...Array(change.height).keys()]
        for( var i in arr){
            i = parseInt(i)
            b.set_value(change.col, arr[i], -1)
        }
    }
    else if(change instanceof _InsertCellChange){
        var new_indexes = []
        var data = []
        var col_height = b.get_column_height(change.col)
        if(change.height <= col_height)
        {
            for(var i in [...Array(col_height).keys()]){
                i = parseInt(i)
                var value = b.get_value(change.col, i)
                if (i == change.height){
                    data.push(-1)
                }
                if(value == -1){
                    new_indexes.push(i)
                }
                else{
                    data.push(value)
                }
            }
            if(change.height == col_height){
                data.push(-1)
            }
            for(index in new_indexes){
                index = parseInt(index);
                data.splice(new_indexes[index],0, -1);
            }
            for (var i in data){
                i = parseInt(i)
                var value = data[i]
                b.set_value(change.col, i, value)
            }
        }
    }
}

function _color_piece_random(b, max_colors){
    // Colors in the new piece on the board with a random color using the given
    // random number generator and number of colors.
    var colors = _get_new_piece_colors(b, max_colors)
    var color = choice(colors)
    _color_piece(b, color)
}

function _color_piece(b, color){
    // Colors in the new piece on the board with the given color.
    var coords = _get_new_piece_coords(b)
    for(var k in coords)
    {
        k = parseInt(k)
        var i = coords[k][0]
        var j = coords[k][1]
        b.set_value(i, j, color)
    }
}

function _get_new_piece_colors(b, max_colors){
    // Returns the set of possible colors for the new piece.
    var colors = []
    for(var i=1;i<(max_colors + 1);i++){
        colors[i-1] = i
    }
    var coords = _get_new_piece_coords(b)
    for(var k in coords){
        k = parseInt(k)
        var i = coords[k][0]
        var j = coords[k][1]
        var arr = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        for(var m in arr){
            m = parseInt(m)
            var x_ofs = arr[m][0]
            var y_ofs = arr[m][1]
            colors = arrayRemove(colors,b.get_value(i + x_ofs, j + y_ofs))
        }
    }
    return colors
}

function _get_new_piece_coords(b){
    // Returns a list of new piece coordinates.

    var coords = []
    var arr = [...Array(b.width()).keys()]
    for (var i in arr){
        i = parseInt(i)
        var col_height = b.get_column_height(arr[i])
        var arr2 = [...Array(col_height).keys()]
        for (var j in arr2){
            j = parseInt(j)
            i = arr[i]
            j = arr2[j]
            if (b.get_value(i, j) == -1){
                coords.push([i, j])
            }
        }
    }
    return coords
}

function _get_piece_sizes(fragmentation){
    // Returns a list containing the new piece sizes for the board.
    var max_area = max_size[0] * max_size[1] * 0.5;
    var total_area = 0;
    var piece_sizes = []
    while(total_area < max_area){
        var piece_size = _get_piece_size(max_area,fragmentation)
        total_area = total_area + piece_size
        piece_sizes.push(piece_size);
    }
    return piece_sizes
}

function _get_piece_size(max_area,fragmentation){
    // Returns a random piece size using the given random number generator,
    // fragmentation, and board size.
    var upper_bound = Math.ceil(Math.sqrt(max_area));
    value = Math.random()
    var exp = fragmentation
    piece_size = parseInt(Math.max(3, Math.pow(value, exp) * upper_bound))
    return piece_size
}

function _InsertColumnChange(col, height){
    // Represents the action of inserting a column into the board at column
    // "col" containing "height" cells.
    this.col = col;
    this.height = height;
    this.__eq__ = function(other){
        return ((other instanceof _InsertColumnChange) &&
                (this.col == this.col) &&
                (this.height == other.height))
    }

    this.__ne__ = function(other){
        return ! this.__eq__(other)
    }

    this.__repr__ = function(){
        return `_InsertColumnChange(${this.col}, ${this.height})`
    }
}

function _InsertCellChange(col, height){
    // Represents the action of inserting a cell into the board in column
    // "col" at height "height".
    this.col = col;
    this.height = height;
    this.__eq__ = function(other){
        return ((other instanceof _InsertCellChange) &&
                (this.col == other.col) &&
                (this.height == other.height))
    }

    this.__ne__ = function(other){
        return ! this.__eq__(other)
    }

    this.__repr__ = function(){
        return `_InsertCellChange(${this.col}, ${this.height})`
    }
}