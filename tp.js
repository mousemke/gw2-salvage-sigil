var http        = require( 'http' );

var userConfig = {
    diffMinEcto : 7500, // 75s + ecto? = free dark matter
    diffMin     : 12500
};


/**
 * API get
 *
 * gets and parses JSON from api sources
 *
 * @param  {str}                    _url                target url
 * @param  {func}                   _cb                 callback
 * @param  {bool}                   secure              http or https
 *
 * @return {void}
 */
function apiGet( _url, _cb, secure )
{
    secure = ( secure === false ) ? false : true;

    var callback = function( res )
    {
        var body = '';

        res.on( 'data', function( chunk )
        {
            body += chunk;
        });

        res.on( 'end', function()
        {
            var data;
            try
            {
                data = JSON.parse( body );
                _cb( data );
            }
            catch( e )
            {
                console.log( _url + ' appears to be down' );
            }
        });

    };

    http.get( _url, callback ).on( 'error', function( e )
    {
        console.log( 'Got error: ', e );
    });
}


function buildWeaponList( weapons, sigilsByName )
{
    var sigil, weaponListList = [];
    console.log( '\nWeapons:' );
    for ( var i = 0, lenI = weapons.length; i < lenI; i++ ) 
    {
        sigil = sigilsByName[ weapons[ i ].name.split( ' of ' )[ 1 ] ];
    
        for ( prop in sigil )
        {
            if ( prop === 'min_sale_unit_price' )
            {
                var diff = sigil[ 'min_sale_unit_price' ] - weapons[ i ][ 'min_sale_unit_price' ];

                if ( diff > userConfig.diffMinEcto && weapons[ i ][ 'min_sale_unit_price' ] !== 0  )  
                {
                    var message = weapons[ i ].name + ' ' + sigil[ 'min_sale_unit_price' ] + ' ' + weapons[ i ][ 'min_sale_unit_price' ];
                    if ( diff < userConfig.diffMin )
                    {
                        message += ' (sell ecto)';
                    }
                    console.log( message );
                    weaponListList.push( weapons[ i ] );
                }
            }
        }
    }
    if ( weaponListList.length < 1 )
    {
        console.log( 'nothing in range right now' );   
    }

    // console.log( weaponListList ); // full list object
}


function getsigils( weapons, sigilNames )
{
    var url = 'http://www.gw2spidy.com/api/v0.9/json/all-items/17';

    apiGet( url, function( info )
    {
        var sigil, sigils = {};

        for ( result in info )
        {
            if ( typeof info[ result ] === 'object' )
            {
                var obj = info[ result ];

                for ( var i = 0, lenI = obj.length; i < lenI; i++ ) 
                {
                    var item    = obj[ i ];
                    var name    = item.name.split( ' of ' )[ 1 ];

                    if ( item.name.indexOf( 'Superior Sigil' ) !== -1 &&
                        sigilNames.indexOf( name ) !== -1  )
                    {
                        sigils[ name ] = item;
                    }
                }
            }
        }

        buildWeaponList( weapons, sigils );
    } );
}


function getWeapons()
{
    var url = 'http://www.gw2spidy.com/api/v0.9/json/all-items/18';
    apiGet( url, function( info )
    {
        var sigil, items = [], sigils = [];

        for ( result in info )
        {
            if ( typeof info[ result ] === 'object' )
            {
                var obj = info[ result ];

                for ( var i = 0, lenI = obj.length; i < lenI; i++ ) 
                {
                    var item = obj[ i ];

                    if ( item.rarity === 5 && item.name.indexOf( ' of ' ) !== -1 )
                    {
                        sigil = item.name.split( ' of ' )[ 1 ];
                        sigils.push( sigil );
                        items.push( item );
                    }
                }
            }
        }

        getsigils( items, sigils );
    } );
}

getWeapons();

/* *******************************************************************/




function buildArmorList( weapons, runesByName )
{
    var rune, armorList = [];
    console.log( '\nArmor:' );
    for ( var i = 0, lenI = weapons.length; i < lenI; i++ ) 
    {
        rune = runesByName[ weapons[ i ].name.split( ' of ' )[ 1 ] ];

        for ( prop in rune )
        {
            if ( prop === 'min_sale_unit_price' )
            {
                var diff = rune[ 'min_sale_unit_price' ] - weapons[ i ][ 'min_sale_unit_price' ];

                if ( diff > userConfig.diffMinEcto && weapons[ i ][ 'min_sale_unit_price' ] !== 0  )  
                {
                    var message = weapons[ i ].name + ' ' + rune[ 'min_sale_unit_price' ] + ' ' + weapons[ i ][ 'min_sale_unit_price' ];
                    if ( diff < userConfig.diffMin )
                    {
                        message += ' (sell ecto)';
                    }
                    console.log( message );
                    armorList.push( weapons[ i ] );
                }
            }
        }
    }
    if ( armorList.length < 1 )
    {
        console.log( 'nothing in range right now' );   
    }

    // console.log( armorList ); // full list object
}


function getRunes( weapons, runeNames )
{
    var url = 'http://www.gw2spidy.com/api/v0.9/json/all-items/17';

    apiGet( url, function( info )
    {
        var rune, runes = {};

        for ( result in info )
        {
            if ( typeof info[ result ] === 'object' )
            {
                var obj = info[ result ];

                for ( var i = 0, lenI = obj.length; i < lenI; i++ ) 
                {
                    var item    = obj[ i ];
                    var name    = item.name.split( ' of ' )[ 1 ];

                    if ( item.name.indexOf( 'Superior Rune' ) !== -1 &&
                        runeNames.indexOf( name ) !== -1  )
                    {
                        runes[ name ] = item;
                    }
                }
            }
        }

        buildArmorList( weapons, runes );
    } );
}


function getArmor()
{
    var url = 'http://www.gw2spidy.com/api/v0.9/json/all-items/0';
    apiGet( url, function( info )
    {
        var rune, items = [], runes = [];

        for ( result in info )
        {
            if ( typeof info[ result ] === 'object' )
            {
                var obj = info[ result ];

                for ( var i = 0, lenI = obj.length; i < lenI; i++ ) 
                {
                    var item = obj[ i ];

                    if ( item.rarity === 5 && item.name.indexOf( ' of ' ) !== -1 )
                    {
                        rune = item.name.split( ' of ' )[ 1 ];
                        runes.push( rune );
                        items.push( item );
                    }
                }
            }
        }

        getRunes( items, runes );
    } );
}

getArmor();


