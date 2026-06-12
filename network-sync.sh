#!/bin/bash

IP=$1
MAC=$2
DOWN_SPEED=$3
UP_SPEED=$4
ACTION=$5

WAN_IF="enp0s3"
LAN_IF="enp0s8"

# Ej: 192.168.10.5 -> ID 105
TC_ID=$(echo $IP | cut -d'.' -f4)

clean_rules() {
    iptables -D FORWARD -s $IP -m mac --mac-source $MAC -j ACCEPT 2>/dev/null

    tc filter del dev $LAN_IF protocol ip parent 1: prio 1 handle $TC_ID filterid ::: 2>/dev/null
    tc class del dev $LAN_IF parent 1: classid 1:$TC_ID 2>/dev/null
}

case "$ACTION" in
    HABILITAR)
        clean_rules

        iptables -A FORWARD -s $IP -m mac --mac-source $MAC -j ACCEPT

        tc class add dev $LAN_IF parent 1: classid 1:$TC_ID htb rate ${DOWN_SPEED}kbit ceil ${DOWN_SPEED}kbit
        tc filter add dev $LAN_IF protocol ip parent 1: prio 1 handle $TC_ID fw classid 1:$TC_ID

        echo "Red configurada: IP $IP [ACTIVO]"
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
