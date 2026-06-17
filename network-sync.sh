#!/bin/bash

IP=$1
MAC=$2
DOWN_SPEED=$3
UP_SPEED=$4
ACTION=$5

WAN_IF="wlp1s0"
LAN_IF="enp0s31f6"

# Ej: 192.168.10.5 -> ID 105
TC_ID=$(echo $IP | cut -d'.' -f4)

clean_rules() {
    # Eliminar reglas de aceptación y marcado previas
    iptables -D FORWARD -s $IP -m mac --mac-source $MAC -j ACCEPT 2>/dev/null
    iptables -t mangle -D FORWARD -d $IP -j MARK --set-mark $TC_ID 2>/dev/null

    # Limpiar filtros y clases de tc
    tc filter del dev $LAN_IF protocol ip parent 1: prio 1 handle $TC_ID fw classid 1:$TC_ID 2>/dev/null
    tc class del dev $LAN_IF parent 1: classid 1:$TC_ID 2>/dev/null
}

case "$ACTION" in
    HABILITAR)
        clean_rules

        # 1. Permitir que el cliente suba datos a internet (Uplink)
        iptables -A FORWARD -s $IP -m mac --mac-source $MAC -j ACCEPT

        # 2. MARCAR los paquetes que van DE REGRESO al cliente (Downlink) para que TC los vea en LAN
        iptables -t mangle -A FORWARD -d $IP -j MARK --set-mark $TC_ID

        # 3. Crear la clase HTB de control de tráfico
        tc class add dev $LAN_IF parent 1: classid 1:$TC_ID htb rate ${DOWN_SPEED}kbit ceil ${DOWN_SPEED}kbit
        
        # 4. El filtro intercepta los paquetes basados en la marca 'fw' creada en el paso 2
        tc filter add dev $LAN_IF protocol ip parent 1: prio 1 handle $TC_ID fw classid 1:$TC_ID
        ;;

    DESHABILITAR)

        clean_rules
        echo "Red suspendida: IP $IP [VENCIDO]"
        ;;

    ELIMINAR)

        clean_rules
        # Eliminar también de dhcpd
        echo "Red purgada por completo: IP $IP [BAJA]"
        ;;

    *)
        echo "Acción no válida"
        exit 1
        ;;
esac
