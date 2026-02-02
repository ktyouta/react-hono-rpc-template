import type { Meta, StoryObj } from '@storybook/react';
import { UpdateUser } from './update-user';

const meta: Meta<typeof UpdateUser> = {
    title: 'features/updateuser',
    component: UpdateUser,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        errMessage: '',
        yearCoomboList: [
            { label: '選択してください', value: '' },
            { label: '2000', value: '2000' },
            { label: '1999', value: '1999' },
            { label: '1998', value: '1998' },
        ],
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
        watch: ((name: string) => {
            const values: Record<string, string> = {
                'birthday.year': '2000',
                'birthday.month': '01',
            };
            return values[name] ?? '';
        }) as any,
        handleConfirm: async () => {
            alert("登録ボタンが押されました");
        },
    },
};

export default meta;
type Story = StoryObj<typeof UpdateUser>;

export const Default: Story = {};
