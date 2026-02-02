import type { Meta, StoryObj } from '@storybook/react'
import { BodyContainer } from '../body/body-container'
import { Sample } from './sample'

const meta: Meta<typeof Sample> = {
    title: 'features/sample/sample',
    component: Sample,
}

export default meta
type Story = StoryObj<typeof Sample>


export const Default: Story = {
    render: () => {
        return (
            <Sample>
                <BodyContainer />
            </Sample>
        )
    },
}

export const Custom: Story = {
    render: () => {
        return (
            <Sample>
                <div>
                    message
                </div>
            </Sample>
        )
    },
}