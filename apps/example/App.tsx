import type { Elevation } from '@no-problem/design-system'
import { Button, Surface, useMaterialAdapter, useTheme } from '@no-problem/design-system'
import { DesignSystemProvider } from '@no-problem/design-system-expo'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'

const elevations: Elevation[] = ['flat', 'raised', 'floating', 'overlay']

function Heading({ children }: { children: string }) {
  const theme = useTheme()
  return (
    <Text style={{ color: theme.colors.onBackground, fontSize: 13, fontWeight: '600', letterSpacing: 1 }}>
      {children}
    </Text>
  )
}

function Body({ children }: { children: string }) {
  const theme = useTheme()
  return <Text style={{ color: theme.colors.onSurface, fontSize: 15 }}>{children}</Text>
}

/**
 * What the device actually answered.
 *
 * The one thing a browser cannot tell us. Everything below it is the same code
 * that the catalog already renders on the web.
 */
function WhatThisDeviceOffers() {
  const theme = useTheme()
  const { capabilities, GlassSurface } = useMaterialAdapter()

  const lines = [
    `glass available   ${capabilities.glass.available}`,
    `glass interactive ${capabilities.glass.interactive}`,
    `reduced transparency ${capabilities.reduceTransparency}`,
    `renderer supplied ${GlassSurface !== undefined}`,
  ]

  return (
    <Surface elevation="raised" padding="lg" radius="md">
      {lines.map((line) => (
        <Text key={line} style={{ color: theme.colors.onSurface, fontFamily: 'Menlo', fontSize: 12 }}>
          {line}
        </Text>
      ))}
    </Surface>
  )
}

function Screen() {
  const theme = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <Heading>THIS DEVICE</Heading>
        <WhatThisDeviceOffers />

        <Heading>SURFACES</Heading>
        <View style={{ gap: 12 }}>
          {elevations.map((elevation) => (
            <Surface key={elevation} elevation={elevation} padding="lg" radius="md">
              <Body>{elevation}</Body>
            </Surface>
          ))}
        </View>

        <Heading>BUTTONS</Heading>
        <Surface elevation="flat" padding="lg" radius="md">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <DesignSystemProvider colorSource="auto">
      <StatusBar style="auto" />
      <Screen />
    </DesignSystemProvider>
  )
}
