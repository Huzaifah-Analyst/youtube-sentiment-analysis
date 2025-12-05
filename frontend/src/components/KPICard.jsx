import { Card, Metric, Text } from '@tremor/react';

export default function KPICard({ title, value, subtitle, icon, color = 'blue' }) {
    const colorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
    };

    return (
        <Card decoration="top" decorationColor={color}>
            <div className="flex justify-between items-start">
                <div>
                    <Text>{title}</Text>
                    <Metric className={colorClasses[color] || colorClasses.blue}>{value}</Metric>
                    {subtitle && <Text className="mt-1">{subtitle}</Text>}
                </div>
                {icon && (
                    <div className={`text-3xl ${colorClasses[color] || colorClasses.blue}`}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}
