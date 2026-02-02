import type { Meta, StoryObj } from '@storybook/react'
import { useBody } from '../../hooks/use-body'
import { Body } from './body'

const meta: Meta<typeof Body> = {
    title: 'features/sample/body',
    component: Body,
}

export default meta
type Story = StoryObj<typeof Body>


const BodyWithState = () => {

    const props = useBody();

    return (
        <Body
            {...props}
        />
    )
}

export const Default: Story = {
    render: () => <BodyWithState />,
}
