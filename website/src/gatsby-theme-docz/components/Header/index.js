/** @jsx jsx */
import { jsx, Box, Flex, useColorMode } from 'theme-ui'
import { useConfig, useCurrentDoc } from 'docz'

import * as styles from 'gatsby-theme-docz/src/components/Header/styles'
import { Edit, Menu, Sun, Github } from 'gatsby-theme-docz/src/components/Icons'

export const Header = props => {
  const { onOpen } = props
  const config = useConfig()
  const { edit = true, ...doc } = useCurrentDoc()
  const [colorMode, setColorMode] = useColorMode()

  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light')
  }

  return (
    <div sx={styles.wrapper} data-testid={'header'}>
      <Box sx={{...styles.menuIcon, top: 'calc(100% + 25px)',}}>
        <button sx={styles.menuButton} onClick={onOpen}>
          <Menu size={25} />
        </button>
      </Box>
      <div sx={{...styles.innerContainer, py: '26px'}}>
        {edit && doc.link && (
          <a
            sx={{...styles.editButton, bottom: -50}}
            href={doc.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Edit width={14} />
            <Box sx={{ pl: 2 }}>Edit page</Box>
          </a>
        )}
      </div>
    </div>
  )
}
