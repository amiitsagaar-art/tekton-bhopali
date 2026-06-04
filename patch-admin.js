const fs = require('fs');

const file = 'src/app/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add 'serviceAreas' to activeTab state
content = content.replace(/useState<"bookings" | "workers">/, 'useState<"bookings" | "workers" | "serviceAreas">');

// 2. Add serviceAreas state
if (!content.includes('const [serviceAreas, setServiceAreas] = useState')) {
  content = content.replace(/const \[workers, setWorkers\] = useState<Array<\{[^]*?\}>>\(\[\]\)/, `$&
  
  const [serviceAreas, setServiceAreas] = useState<Array<{
    id: string
    name: string
    isActive: boolean
  }>>([])`);
}

// 3. Add fetch for service areas
if (!content.includes('fetch("/api/service-areas")')) {
  content = content.replace(/const \[bookRes, workerRes\] = await Promise.all\(\[[\s\S]*?fetch\("\/api\/workers"\),[\s\S]*?\]\)/, `const [bookRes, workerRes, areaRes] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/workers"),
          fetch("/api/service-areas"),
        ])`);
        
  content = content.replace(/const workersData = workerRes.ok \? await workerRes.json\(\) : \[\]/, `const workersData = workerRes.ok ? await workerRes.json() : []
        const areaData = areaRes.ok ? await areaRes.json() : []`);
        
  content = content.replace(/setWorkers\(workersData\)/, `setWorkers(workersData)
        setServiceAreas(areaData)`);
        
  content = content.replace(/setWorkers\(\[\]\)/, `setWorkers([])
        setServiceAreas([])`);
}

// 4. Add MapPin to lucide-react import
content = content.replace(/import \{ LogOut, Calendar, Users, FileCheck, CheckCircle, XCircle, AlertCircle \} from "lucide-react"/, `import { LogOut, Calendar, Users, FileCheck, CheckCircle, XCircle, AlertCircle, MapPin } from "lucide-react"`);

// 5. Add toggle function
if (!content.includes('const toggleServiceArea')) {
  content = content.replace(/const assignWorkerToBooking = async [\s\S]*?};/, `$&

  const toggleServiceArea = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(\`/api/service-areas\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      })
      if (!res.ok) throw new Error("Failed to update area")
      setServiceAreas(prev =>
        prev.map(a => (a.id === id ? { ...a, isActive: !currentStatus } : a))
      )
    } catch (e) {
      console.error(e)
    }
  }`);
}

// 6. Add tab button for Service Areas
content = content.replace(/<\/button>\s*<\/div>\s*\{\/\* Tab content \*\/\}/, `</button>
          <button
            onClick={() => setActiveTab("serviceAreas")}
            className={\`pb-4 text-sm sm:text-base font-bold transition-all relative flex items-center gap-2 \${activeTab === "serviceAreas" ? "text-yellow-400" : "text-slate-400 hover: text-slate-200"}\`}
          >
            Service Zones
            {activeTab === "serviceAreas" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            )}
          </button>
        </div>
        
        {/* Tab content */}`);

// 7. Add Service Areas UI
content = content.replace(/\{\/\* Tab content \*\/\}\s*<div className="bg-slate-900\/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">\s*\{activeTab === "bookings" \? \(/, `$&`);

// Let's do this cleaner. We will replace the entire Tab content rendering.
// Find the closing brace of the worker's table rendering.
const workerBlockEnd = `                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}`;

const replacementBlockEnd = `                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "serviceAreas" ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-400" /> Bhopal Service Zones
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {serviceAreas.map(area => (
                  <div key={area.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">{area.name}</h3>
                      <p className="text-xs text-slate-400">{area.isActive ? "Active" : "Disabled"}</p>
                    </div>
                    <button
                      onClick={() => toggleServiceArea(area.id, area.isActive)}
                      className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none \${area.isActive ? 'bg-emerald-500' : 'bg-slate-600'}\`}
                    >
                      <span
                        className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${area.isActive ? 'translate-x-6' : 'translate-x-1'}\`}
                      />
                    </button>
                  </div>
                ))}
                {serviceAreas.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-slate-500">
                    No service areas found.
                  </div>
                )}
              </div>
            </div>
          ) : null}`;

content = content.replace(workerBlockEnd, replacementBlockEnd);

fs.writeFileSync(file, content);
console.log('Admin page patched successfully.');
