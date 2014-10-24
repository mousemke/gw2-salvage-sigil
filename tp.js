var http        = require( 'http' );

var userConfig = {
    ectoPrice   : 4000, 
    diffMin     : 0.15
};

function decToGSC( price )
{
    var g, s, c, negative = '';
    price = price.toString();

    if ( price[ 0 ] === '-' )
    {
        price       = price.slice( 1 );
        negative    = '-';
    }

    while ( price.length < 6 )
    {
        price = '0' + price;
    }

    c = price.slice( price.length - 2 );
    s = price.slice( price.length - 4, price.length - 2 );
    g = parseInt( price.slice( 0, price.length - 4 ) );


    var text = c + 'c';
    if ( g !== 0 && parseInt( s ) !== 0 )
    {
        text = s + 's ' + text;
    }
    if ( g !== 0 )
    {

        text = g + 'g ' + text;
    }

    while ( text[ 0 ] === '0' )
    {
        text = text.slice( 1 );
    }

    return negative + text;
}


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
    console.log( '+++++++++++++++++  Weapons  +++++++++++++++++' );
    for ( var i = 0, lenI = weapons.length; i < lenI; i++ ) 
    {
        sigil = sigilsByName[ weapons[ i ].name.split( ' of ' )[ 1 ] ];
    
        for ( prop in sigil )
        {
            if ( prop === 'min_sale_unit_price' )
            {
                var diff    = sigil[ 'min_sale_unit_price' ] - weapons[ i ][ 'min_sale_unit_price' ];
                var diffMin = sigil[ 'min_sale_unit_price' ] * userConfig.diffMin;

                if ( diff > diffMin && weapons[ i ][ 'min_sale_unit_price' ] !== 0  )  
                {
                    var message = weapons[ i ].name + '\nSigil: ' + decToGSC( sigil[ 'min_sale_unit_price' ] ) + 
                                    '   ||  Weapon: ' + decToGSC( weapons[ i ][ 'min_sale_unit_price' ] ) + '\n' + 
                                    decToGSC( diff ) + ' net gain';

                    message += '\n';

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

                    if ( item.rarity === 5 && item.restriction_level >= 75 && item.name.indexOf( ' of ' ) !== -1 )
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




function buildArmorList( armor, runesByName )
{
    var rune, armorList = [];
    console.log( '+++++++++++++++++  Armor  ++++++++++++++++++' );
    for ( var i = 0, lenI = armor.length; i < lenI; i++ ) 
    {
        rune = runesByName[ armor[ i ].name.split( ' of ' )[ 1 ] ];

        for ( prop in rune )
        {
            if ( prop === 'min_sale_unit_price' )
            {
                var diff = rune[ 'min_sale_unit_price' ] - armor[ i ][ 'min_sale_unit_price' ];
                var diffMin = rune[ 'min_sale_unit_price' ] * userConfig.diffMin;

                if ( diff > diffMin && armor[ i ][ 'min_sale_unit_price' ] !== 0  )  
                {
                    var message = armor[ i ].name + '\nRune: ' + decToGSC( rune[ 'min_sale_unit_price' ] ) 
                                + '   ||  Armor: ' + decToGSC( armor[ i ][ 'min_sale_unit_price' ] ) + '\n' + 
                                    decToGSC( diff ) + ' net gain';

                    message += '\n';
                    console.log( message );
                    armorList.push( armor[ i ] );
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

                    if ( item.rarity === 5 && item.restriction_level >= 75 && item.name.indexOf( ' of ' ) !== -1 )
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


