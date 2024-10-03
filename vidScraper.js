

const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getVids() {
  const finalListings = await getScreeningData();
  return  finalListings
}
async function getScreeningData() {
   // const place = somehow
    const url = 'https://vidiotsfoundation.org/wp-json/nj/v1/showtime/listings';
    try {
        const res = await fetch(url);
        const json = await res.json();
        const showtimes = json.showtimes;
        const listings = getByShowtimes(showtimes);
        return listings
    } catch (err) {
        console.log(`${err} for ${url}`);
    }
   return []
}
async function getByShowtimes(showtimes,page) {
    let cleanedData = [];
    
     for (const show of showtimes) {
         const url = `https://vidiotsfoundation.org/wp-json/nj/v1/show/${show.movie_id}`;
         try {
             const res = await fetch(url);
             const json = await res.json(); 
             const screening = json; 
             const listing = createListing(screening,show);
             cleanedData.push(listing);
         } catch (err) {
            console.log(`${err} for ${url}`);
         }
     }
   
     return cleanedData
    }
    function createListing(screening,show) {
        const startDate = new Date(show.datetime.substring(0,4),show.datetime.substring(4,6)-1,show.datetime.substring(6,8),show.datetime.substring(8,10),show.datetime.substring(10,12));
        try {
            return {
                type: 'Screening',
                startDate,
                QA:  isQAndA(decodeHtmlCharCodes(screening.content.rendered)), 
                url: show.purchase_url,
                name: decodeHtmlCharCodes(screening.title.rendered).replaceAll('&amp;', '&'),
                workingText: decodeHtmlCharCodes(screening.content.rendered),
                workPresented: [{
                    name: decodeHtmlCharCodes(screening.title.rendered).replaceAll('&amp;', '&'),
                    duration: screening._length, 
                    director: getDirector(screening),
                    year: getYear(screening),
                    videoFormat: getFormat(screening),
                    }]
               }
        }
        catch (err) {
            console.log(`${err} for ${show}`);
            return {}
        }
        
    }
function decodeHtmlCharCodes(str) { 
    return str.replace(/(&#(\d+);)/g, function(match, capture, charCode) {
      return String.fromCharCode(charCode);
    });
  }
function getFormat(data) {  
    if(data?.format.length == 0) {
        return '';
    }
    return data?.format && data.format.length === 1 ? data.format[0].name : (data?.format[0]?.name + ' ' + data?.format[1]?.name)
}
function getYear(data) {
    if(data._release_date) {
        return data._release_date.substring(0,4)
    }
    else {
        return ''
    }
}
function getDirector(data) {
    let director = data?.director && data.director?.length === 1 ? data.director[0].name : (data?.director[0]?.name + ' & ' + data?.director[1]?.name);
    if(director.includes('undefined')){
        director = '     ';
    }
    return director
}
module.exports = getVids;
