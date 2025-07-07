<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $order;

    /**
     * Create a new event instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order->load('breakdowns.nominee');
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('orders');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'order.updated';
    }

    /**
     * The data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id'         => $this->order->id,
            'stock'      => $this->order->stock,
            'price'      => $this->order->price,
            'lots'       => $this->order->lots,
            'order_type' => $this->order->order_type,
            'status'     => $this->order->status,
            'breakdowns' => $this->order->breakdowns->map(function ($bd) {
                return [
                    'id'         => $bd->id,
                    'nominee'    => $bd->nominee->name ?? '-',
                    'stock'      => $bd->stock,
                    'price'      => $bd->price,
                    'lots'       => $bd->lots,
                    'status'     => $bd->status,
                    'executed_at'=> $bd->execution_time,
                ];
            }),
        ];
    }
}
