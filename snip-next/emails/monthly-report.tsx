import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
} from '@react-email/components'
import * as React from 'react'

interface MonthlyReportEmailProps {
  name: string
  month: string
  totalClicks: number
  topLink: {
    title: string
    clicks: number
    shortUrl: string
  }
  dashboardUrl: string
}

export const MonthlyReportEmail = ({
  name = 'User',
  month = 'November',
  totalClicks = 1250,
  topLink = {
    title: 'My Awesome Campaign',
    clicks: 450,
    shortUrl: 'https://snip.com/abc1234',
  },
  dashboardUrl = 'https://snip.com/dashboard',
}: MonthlyReportEmailProps) => {
  const previewText = `Your Snip Monthly Report for ${month}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Your <strong>{month}</strong> Report
              </Heading>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {name},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Here's how your links performed this month.
            </Text>

            <Section className="bg-gray-50 rounded-lg p-6 my-6 text-center">
              <Text className="text-gray-500 text-sm uppercase tracking-wider mb-2">Total Clicks</Text>
              <Text className="text-4xl font-bold text-indigo-600 m-0">{totalClicks.toLocaleString()}</Text>
            </Section>

            <Section className="my-6">
              <Text className="font-semibold mb-4">Top Performing Link</Text>
              <div className="border border-gray-200 rounded p-4">
                <Text className="font-medium m-0">{topLink.title}</Text>
                <Text className="text-indigo-600 text-sm my-1">{topLink.shortUrl}</Text>
                <Text className="text-gray-500 text-sm m-0">{topLink.clicks.toLocaleString()} clicks</Text>
              </div>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={dashboardUrl}
              >
                View Full Report
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              © 2024 Snip. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default MonthlyReportEmail
