const getColors = require('get-image-colors')
const path = require('path')

getColors(path.join(__dirname, 'public/netLogo.jpeg')).then(colors => {
  // `colors` is an array of color objects
  console.log('Dominant colors:')
  console.log(colors.map(color => color.hex()))
}).catch(err => {
  console.error("Error:", err)
})
