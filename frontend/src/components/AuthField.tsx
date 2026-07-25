import { InputHTMLAttributes, ReactNode, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/* -------------------------------------------------------------------------- */
/*  AuthField                                                                 */
/*                                                                            */
/*  A modern, icon-prefixed input used by the Login and Register pages.       */
/*  This is presentation only — it forwards every native input prop and       */
/*  never touches auth, API or validation logic.                              */
/* -------------------------------------------------------------------------- */

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Label shown above the input. */
    label: string;
    /** Icon rendered inside the input on the leading side. */
    leadingIcon: ReactNode;
    /** Optional element rendered on the trailing side (e.g. a password toggle). */
    trailingAccessory?: ReactNode;
    /** Visual error state. */
    invalid?: boolean;
}

const baseFieldCls =
    'block w-full rounded-xl border bg-white text-sm text-slate-800 ' +
    'placeholder:text-slate-400 transition ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ' +
    'disabled:bg-slate-50 disabled:text-slate-500';

const stateCls = (invalid?: boolean) =>
    invalid
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
        : 'border-slate-200 hover:border-slate-300';

export function AuthField({
    label,
    leadingIcon,
    trailingAccessory,
    invalid,
    className = '',
    id,
    ...rest
}: AuthFieldProps) {
    const inputId = id ?? `auth-field-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="space-y-1.5">
            <label
                htmlFor={inputId}
                className="block text-xs font-semibold text-slate-700"
            >
                {label}
            </label>
            <div className="relative">
                <span
                    aria-hidden="true"
                    className={[
                        'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5',
                        invalid ? 'text-red-400' : 'text-slate-400',
                    ].join(' ')}
                >
                    {leadingIcon}
                </span>
                <input
                    id={inputId}
                    {...rest}
                    className={[
                        baseFieldCls,
                        stateCls(invalid),
                        'pl-10',
                        trailingAccessory ? 'pr-11' : 'pr-3.5',
                        'py-2.5',
                        className,
                    ].join(' ')}
                />
                {trailingAccessory && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                        {trailingAccessory}
                    </span>
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  PasswordField                                                             */
/*                                                                            */
/*  Convenience wrapper around `AuthField` for password inputs — adds the     */
/*  show/hide toggle button.                                                  */
/* -------------------------------------------------------------------------- */

interface PasswordFieldProps extends Omit<AuthFieldProps, 'trailingAccessory' | 'leadingIcon'> {
    leadingIcon: ReactNode;
    /** Force the input type. Defaults to `password`. */
    forceType?: 'password' | 'text';
}

export function PasswordField(props: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);
    const { forceType, leadingIcon, ...rest } = props;
    const type = forceType ?? (visible ? 'text' : 'password');

    return (
        <AuthField
            {...rest}
            type={type}
            leadingIcon={leadingIcon}
            trailingAccessory={
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                    {visible ? (
                        <EyeSlashIcon
                            className="h-[1.125rem] w-[1.125rem]"
                        />
                    ) : (
                        <EyeIcon
                            className="h-[1.125rem] w-[1.125rem]"
                        />
                    )}
                </button>
            }
        />
    );
}
