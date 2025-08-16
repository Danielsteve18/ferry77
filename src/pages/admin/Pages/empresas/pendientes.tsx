import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminLayout from "@/pages/admin/components/AdminLayout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PendientesEmpresas() {
  const [usuarios, setUsuarios] = useState([]);
  const [aceptados, setAceptados] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [rechazados, setRechazados] = useState([]);
  const [alerta, setAlerta] = useState("");
  const [view, setView] = useState("dia");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const lista = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          status: data.status?.toLowerCase().trim() || "pendiente",
          rol: data.rol?.toLowerCase().trim() || "usuario",
          createdAt: data.createdAt || null,
        };
      });

      const aceptados = lista.filter(
        (u) => u.status === "aceptado" && u.rol === "empresa"
      );
      const pendientes = lista.filter(
        (u) => u.status === "pendiente" && u.rol === "empresa"
      );
      const rechazados = lista.filter(
        (u) => u.status === "rechazado" && u.rol === "empresa"
      );

      setUsuarios(lista);
      setAceptados(aceptados);
      setPendientes(pendientes);
      setRechazados(rechazados);
    } catch (error) {
      setAlerta("Hubo un problema al cargar los usuarios.");
    }
  };

  const cambiarAverificacion = () => {
    window.location.href = "/admin/verification";
  };

  useEffect(() => {
    const agrupados = agruparPorFechaYEstado(
      { pendientes, aceptados, rechazados },
      view
    );
    setChartData(agrupados);
  }, [pendientes, aceptados, rechazados, view]);

  const agruparPorFechaYEstado = (
    grupos: { pendientes: any[]; aceptados: any[]; rechazados: any[] },
    vista: string
  ) => {
    const formato =
      {
        dia: "yyyy-MM-dd",
        mes: "yyyy-MM",
        año: "yyyy",
      }[vista] || "yyyy-MM-dd";

    const fechas: Record<string, any> = {};

    const agregarGrupo = (usuarios: any[], key: string) => {
      usuarios.forEach((u) => {
        let fechaRaw = u.createdAt;
        if (!fechaRaw) return;

        let fecha: Date;
        if (typeof fechaRaw === "string") {
          fecha = new Date(fechaRaw);
        } else if (fechaRaw.seconds) {
          fecha = new Date(fechaRaw.seconds * 1000);
        } else {
          fecha = new Date(fechaRaw);
        }

        if (isNaN(fecha.getTime())) return;

        const label = format(fecha, formato);
        if (!fechas[label]) fechas[label] = { label };
        fechas[label][key] = (fechas[label][key] || 0) + 1;
      });
    };

    agregarGrupo(grupos.pendientes, "pendientes");
    agregarGrupo(grupos.aceptados, "aceptados");
    agregarGrupo(grupos.rechazados, "rechazados");

    return Object.values(fechas).sort(
      (a, b) => new Date(a.label).getTime() - new Date(b.label).getTime()
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen space-y-8 p-4">
        {/* Sección 1: Empresas disponibles */}
        <section className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Empresas pendientes</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cambiarAverificacion()}
            >
              Verificar
            </Button>
          </div>

          {pendientes.map((usuario) => (
            <Card key={usuario.id} className="w-full mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    {usuario.name}
                  </h3>
                  <p className="text-sm text-gray-500">{usuario.rol}</p>
                </div>
              </div>
            </Card>
          ))}

          {alerta && (
            <Alert className="mt-4">
              <AlertTitle>Actualización</AlertTitle>
              <AlertDescription>{alerta}</AlertDescription>
            </Alert>
          )}
        </section>

        {/* Sección 2: Gráfico de evolución */}
        <section className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Evolución de empresas</CardTitle>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="dia">Día</option>
              <option value="mes">Mes</option>
              <option value="año">Año</option>
            </select>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Pendientes: {pendientes.length} · Aceptadas: {aceptados.length} ·
            Rechazadas: {rechazados.length}
          </p>

          {chartData.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay datos suficientes para mostrar el gráfico.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="label"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pendientes"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Pendientes"
                />
                <Line
                  type="monotone"
                  dataKey="aceptados"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Aceptadas"
                />
                <Line
                  type="monotone"
                  dataKey="rechazados"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Rechazadas"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
