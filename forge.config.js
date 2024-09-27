module.exports = {
  packagerConfig: {
    asar: true,
    name: "pitogram",
  },
  rebuildConfig: {
    force: true
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'], 
      config: {
        name: 'pitogram',
        description: "Is an application intended for inspection center",
        setupIcon: './src/assets/img/logo-dtnivel.ico' 
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        options: {
          name: 'pitogram',
          description: "Is an application intended for inspection center",
          setupIcon: './src/assets/img/logo-dtnivel.ico' 
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {
        options: {
          name: 'pitogram',
          description: "Is an application intended for inspection center",
          setupIcon: './src/assets/img/logo-dtnivel.ico' 
        }
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ]
};
