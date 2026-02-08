"use client";

import { useState, useEffect } from "react";

interface OwnerCount {
  owner: string;
  count: number;
}

interface Incident {
  callNumber: number;
  completedOn: string;
  completedOnJST: string;
  owner: string | null;
  title: string | null;
  incidentId: string;
}

interface ApiResponse {
  success: boolean;
  date: string;
  totalCount: number;
  ownerCounts: OwnerCount[];
  incidents: Incident[];
  error?: string;
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const fetchData = async (date: string = "today") => {
    setLoading(true);
    setError(null);

    try {
      const params = date && date !== "today" ? `?date=${date}` : "";
      const response = await fetch(`/api/incidents${params}`);
      const result: ApiResponse = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || "データの取得に失敗しました");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleSearch = () => {
    fetchData(selectedDate || "today");
  };

  const handleToday = () => {
    setSelectedDate("");
    fetchData("today");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          D365 完了案件ダッシュボード
        </h1>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-gray-700 font-medium">日付:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border rounded px-3 py-2 text-gray-700"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              検索
            </button>
            <button
              onClick={handleToday}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              本日
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">エラー</p>
            <p>{error}</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                サマリー
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600">対象日</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {data.date === "today" ? "本日" : data.date}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">完了案件数</p>
                  <p className="text-2xl font-bold text-green-800">
                    {data.totalCount} 件
                  </p>
                </div>
              </div>
            </div>

            {/* Owner Counts */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                所有者別完了件数
              </h2>
              {data.ownerCounts.length === 0 ? (
                <p className="text-gray-500">データがありません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          順位
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          所有者
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          件数
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          割合
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ownerCounts.map((item, index) => (
                        <tr
                          key={item.owner}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-gray-600">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium">
                            {item.owner}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800 font-bold">
                            {item.count}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${(item.count / data.totalCount) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {((item.count / data.totalCount) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Incidents List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                完了案件一覧
              </h2>
              {data.incidents.length === 0 ? (
                <p className="text-gray-500">データがありません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          案件番号
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          完了日時 (JST)
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          所有者
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.incidents.map((incident, index) => (
                        <tr
                          key={incident.incidentId || index}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-gray-800 font-mono">
                            {incident.callNumber}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {incident.completedOnJST}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {incident.owner || "未割当"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
