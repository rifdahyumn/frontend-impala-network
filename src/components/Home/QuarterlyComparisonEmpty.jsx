import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AlertTriangle, Database } from 'lucide-react';

const QuarterlyComparisonEmpty = ({ error }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {error ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                        <Database className="w-5 h-5 text-gray-600" />
                    )}
                    <span>
                        {error ? "Gagal Memuat Data" : "Data Tidak Tersedia"}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-gray-400 mb-4">
                        {error ? (
                            <AlertTriangle className="h-16 w-16" />
                        ) : (
                            <Database className="h-16 w-16" />
                        )}
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {error ? "Terjadi Kesalahan" : "Belum Ada Data"}
                    </h3>
                    
                    <p className="text-gray-600 max-w-md">
                        {error 
                            ? "Tidak dapat memuat data analisis triwulan. Silakan coba lagi nanti."
                            : "Data analisis triwulan belum tersedia untuk periode yang dipilih."
                        }
                    </p>
                    
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-800">
                                {error.message || "Terjadi kesalahan yang tidak diketahui"}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default QuarterlyComparisonEmpty;