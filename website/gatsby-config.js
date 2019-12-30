module.exports = {
  pathPrefix: `/vz-logger`,
  siteMetadata: {
    title: 'vz-logger',
  },
  plugins: [
    'gatsby-plugin-resolve-src',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-offline',
    'gatsby-plugin-sass',
    'gatsby-plugin-material-ui',
    'gatsby-theme-docz',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'vz-logger',
        short_name: 'vz-logger',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/assets/img/favicon.png', // This path is relative to the root of the site.
      },
    },
  ],
}