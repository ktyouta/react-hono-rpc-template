import type { Meta, StoryObj } from '@storybook/react'
import { BodyContainer } from '../body/body-container'
import { FooterContainer } from '../footer/footer-container'
import { HeaderContainer } from '../header/header-container'
import { Home } from './home'

const meta: Meta<typeof Home> = {
    title: 'features/home/home',
    component: Home,
}

export default meta
type Story = StoryObj<typeof Home>


export const Default: Story = {
    render: () => {
        return (
            <Home>
                <HeaderContainer />
                <BodyContainer />
                <FooterContainer />
            </Home>
        )
    },
}

export const Custom: Story = {
    render: () => {
        return (
            <Home>
                <div>
                    message
                </div>
            </Home>
        )
    },
}