import type { Meta, StoryObj } from '@storybook/react';
import { UpdatePassword } from './update-password';

const meta: Meta<typeof UpdatePassword> = {
    title: 'features/updatepassword',
    component: UpdatePassword,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        errMessage: '',
        back: () => {
            alert("戻るボタンが押されました");
        },
        isLoading: false,
        register: (() => ({
            name: 'name',
            onChange: async () => { },
            onBlur: async () => { },
            ref: () => { },
        })) as any,
        errors: {},
        handleConfirm: async () => {
            alert("登録ボタンが押されました");
        },
    },
};

export default meta;
type Story = StoryObj<typeof UpdatePassword>;

export const Default: Story = {};
