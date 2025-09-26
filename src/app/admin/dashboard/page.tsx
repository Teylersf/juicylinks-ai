"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, TestTube, AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw, Download, Eye, DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { LLM_MODELS, LLMModel } from '@/lib/constants/llm-models'
import { AIModelLogo } from '@/components/ai-model-logo'

interface TestResult {
  provider: string
  model: string
  success: boolean
  response?: string
  error?: string
  responseTime?: number
  timestamp: string
}

interface ClaudeModel {
  id: string
  displayName: string
  createdAt: string
  type: string
}

interface CostStats {
  today: number
  week: number
  month: number
  year: number
  allTime: number
  totalCalls: number
  averageCostPerCall: number
  topModels: Array<{
    model: string
    provider: string
    totalCost: number
    callCount: number
  }>
  dailyBreakdown: Array<{
    date: string
    cost: number
    calls: number
  }>
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTestingAll, setIsTestingAll] = useState(false)
  const [testingModel, setTestingModel] = useState<string | null>(null)
  const [claudeModels, setClaudeModels] = useState<ClaudeModel[]>([])
  const [isLoadingClaudeModels, setIsLoadingClaudeModels] = useState(false)
  const [showClaudeModels, setShowClaudeModels] = useState(false)
  const [claudeModelsError, setClaudeModelsError] = useState<string | null>(null)
  const [costStats, setCostStats] = useState<CostStats | null>(null)
  const [isLoadingCostStats, setIsLoadingCostStats] = useState(true)
  const [costStatsError, setCostStatsError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
    setIsAuthenticated(true)
    fetchCostStats()
  }, [router])

  const fetchCostStats = async () => {
    setIsLoadingCostStats(true)
    setCostStatsError(null)
    
    try {
      const response = await fetch('/api/admin/cost-stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCostStats(data.stats)
      } else {
        setCostStatsError(data.error)
      }
    } catch (error) {
      setCostStatsError(error instanceof Error ? error.message : 'Failed to fetch cost statistics')
    } finally {
      setIsLoadingCostStats(false)
    }
  }

  const testSingleModel = async (provider: string, modelName: string) => {
    setTestingModel(`${provider}-${modelName}`)
    
    try {
      const response = await fetch('/api/admin/test-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          provider,
          model: modelName
        })
      })
      
      const result = await response.json()
      
      const testResult: TestResult = {
        provider,
        model: modelName,
        success: result.success,
        response: result.response,
        error: result.error,
        responseTime: result.responseTime,
        timestamp: new Date().toISOString()
      }
      
      setTestResults(prev => [testResult, ...prev.filter(r => !(r.provider === provider && r.model === modelName))])
      
    } catch (error) {
      const testResult: TestResult = {
        provider,
        model: modelName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      
      setTestResults(prev => [testResult, ...prev.filter(r => !(r.provider === provider && r.model === modelName))])
    } finally {
      setTestingModel(null)
    }
  }

  const testAllModels = async () => {
    setIsTestingAll(true)
    setTestResults([])
    
    for (const [provider, models] of Object.entries(LLM_MODELS)) {
      for (const model of models) {
        await testSingleModel(provider, model.name)
        // Small delay between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    setIsTestingAll(false)
  }

  const fetchClaudeModels = async () => {
    setIsLoadingClaudeModels(true)
    setClaudeModelsError(null)
    
    try {
      const response = await fetch('/api/admin/claude-models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setClaudeModels(data.models)
        setShowClaudeModels(true)
      } else {
        setClaudeModelsError(data.error)
      }
    } catch (error) {
      setClaudeModelsError(error instanceof Error ? error.message : 'Failed to fetch Claude models')
    } finally {
      setIsLoadingClaudeModels(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const getResultForModel = (provider: string, modelName: string) => {
    return testResults.find(r => r.provider === provider && r.model === modelName)
  }

  const successCount = testResults.filter(r => r.success).length
  const failureCount = testResults.filter(r => !r.success).length

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">LLM Model Testing & Diagnostics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchCostStats}
                disabled={isLoadingCostStats}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                {isLoadingCostStats ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>{isLoadingCostStats ? 'Refreshing...' : 'Refresh Stats'}</span>
              </button>
              
              <button
                onClick={fetchClaudeModels}
                disabled={isLoadingClaudeModels}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                {isLoadingClaudeModels ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{isLoadingClaudeModels ? 'Fetching...' : 'Fetch Claude Models'}</span>
              </button>
              
              <button
                onClick={testAllModels}
                disabled={isTestingAll}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                {isTestingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                <span>{isTestingAll ? 'Testing All...' : 'Test All Models'}</span>
              </button>
              
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cost Statistics */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">API Cost Analytics</h2>
              <p className="text-gray-400 text-sm">Total costs across all customers and API calls</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <BarChart3 className="h-4 w-4" />
              <span>Real-time profitability tracking</span>
            </div>
          </div>

          {isLoadingCostStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : costStatsError ? (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <h3 className="font-medium text-red-400">Error Loading Cost Stats</h3>
              </div>
              <p className="text-red-300 text-sm">{costStatsError}</p>
            </div>
          ) : costStats ? (
            <>
              {/* Main Cost Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-green-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-300">Today</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    ${(costStats.today / 100).toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    API costs today
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-300">This Week</span>
                    </div>
                    <div className="text-xs text-gray-500">7 days</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    ${(costStats.week / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Weekly costs
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-gray-300">This Month</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date().toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">
                    ${(costStats.month / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Monthly costs
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-sm font-medium text-gray-300">This Year</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date().getFullYear()}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">
                    ${(costStats.year / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Yearly costs
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-red-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-gray-300">All Time</span>
                    </div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    ${(costStats.allTime / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Total API costs
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-5 w-5 text-cyan-500 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Total API Calls</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {costStats.totalCalls.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    All customers combined
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Avg Cost/Call</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    ${(costStats.averageCostPerCall / 100).toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Per API request
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <DollarSign className="h-5 w-5 text-emerald-500 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Profitability</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {costStats.totalCalls > 0 ? 'Tracking' : 'No Data'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Revenue vs costs
                  </div>
                </div>
              </div>

              {/* Top Models by Cost */}
              {costStats.topModels.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-5 w-5 text-indigo-500 mr-2" />
                    <span className="text-lg font-medium text-white">Most Expensive Models</span>
                  </div>
                  <div className="space-y-3">
                    {costStats.topModels.slice(0, 5).map((model, index) => (
                      <div key={`${model.provider}-${model.model}`} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-white">{model.model}</div>
                            <div className="text-xs text-gray-400">{model.provider} • {model.callCount} calls</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-indigo-400">
                            ${(model.totalCost / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            ${((model.totalCost / model.callCount) / 100).toFixed(4)}/call
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Stats */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <TestTube className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Tested</p>
                  <p className="text-2xl font-bold">{testResults.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Successful</p>
                  <p className="text-2xl font-bold text-green-500">{successCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-500">{failureCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {testResults.length > 0 ? Math.round((successCount / testResults.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Claude Models Section */}
        {showClaudeModels && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <AIModelLogo provider="CLAUDE" size={32} />
                <div>
                  <h2 className="text-xl font-bold">Available Claude Models</h2>
                  <p className="text-gray-400 text-sm">Latest models from Anthropic API</p>
                </div>
              </div>
              <button
                onClick={() => setShowClaudeModels(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {claudeModelsError ? (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <p className="text-red-400">Error: {claudeModelsError}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {claudeModels.map((model, index) => (
                  <div
                    key={model.id}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-mono text-blue-400">{model.id}</span>
                        <span className="text-xs bg-purple-900/20 text-purple-300 px-2 py-1 rounded">
                          {model.type}
                        </span>
                      </div>
                      <h3 className="font-medium text-white mb-1">{model.displayName}</h3>
                      <p className="text-xs text-gray-400">
                        Released: {new Date(model.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(model.id)}
                        className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-xs flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Copy ID</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">💡 How to Update Your Models:</h4>
                  <ol className="text-xs text-blue-200 space-y-1">
                    <li>1. Copy the model IDs you want to use</li>
                    <li>2. Update <code className="bg-gray-700 px-1 rounded">src/lib/constants/llm-models.ts</code></li>
                    <li>3. Replace the CLAUDE models array with the new model IDs</li>
                    <li>4. Test the models using the &quot;Test All Models&quot; button</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Models Grid */}
        <div className="space-y-8">
          {Object.entries(LLM_MODELS).map(([provider, models]) => (
            <div key={provider} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <AIModelLogo provider={provider as 'GROK' | 'OPENAI' | 'CLAUDE' | 'GEMINI' | 'PERPLEXITY'} size={32} />
                  <div>
                    <h2 className="text-xl font-bold">{provider}</h2>
                    <p className="text-gray-400 text-sm">{models.length} models</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model: LLMModel) => {
                  const result = getResultForModel(provider, model.name)
                  const isCurrentlyTesting = testingModel === `${provider}-${model.name}`
                  
                  return (
                    <div
                      key={model.name}
                      className={`border rounded-lg p-4 ${
                        result?.success
                          ? 'border-green-500 bg-green-900/20'
                          : result?.success === false
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-gray-600 bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{model.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{model.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-2">
                          {result && (
                            <div className="flex items-center">
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                          
                          <button
                            onClick={() => testSingleModel(provider, model.name)}
                            disabled={isCurrentlyTesting || isTestingAll}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-2 py-1 rounded text-xs flex items-center space-x-1"
                          >
                            {isCurrentlyTesting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                            <span>{isCurrentlyTesting ? 'Testing...' : 'Test'}</span>
                          </button>
                        </div>
                      </div>
                      
                      {result && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          {result.success ? (
                            <div>
                              <p className="text-xs text-green-400 mb-2">✅ Success</p>
                              {result.responseTime && (
                                <p className="text-xs text-gray-400">Response time: {result.responseTime}ms</p>
                              )}
                              {result.response && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-400 mb-1">Response:</p>
                                  <p className="text-xs text-gray-300 bg-gray-900/50 p-2 rounded max-h-20 overflow-y-auto">
                                    {result.response.substring(0, 200)}...
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs text-red-400 mb-2">❌ Failed</p>
                              {result.error && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Error:</p>
                                  <p className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                                    {result.error}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
